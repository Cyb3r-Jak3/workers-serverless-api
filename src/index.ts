import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './gravatar'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'
import { CORSHandle, CORS_ENDPOINT } from './cors'
import { Hono } from 'hono'
import { EncryptResumeEndpoint } from './resume'
import {
    VersionEndpoint,
    CFEndpoint,
    TraceEndpoint,
    IPEndpoint,
    HealthEndpoint,
    TriggerCron,
} from './misc'
import { WriteDataPoint } from './utils'
import { PyPyChecksumsEndpoint } from './pypy'
import {
    ScrapeCloudflareAPISettings,
    CloudflareAPIEndpoint,
} from './cloudflare_api_proxy'
import { DownloadProxyEndpoint } from './download_proxy'
import { JSONAPIResponse } from '@cyb3r-jak3/workers-common'
import type { DefinedContext } from './types'
import { SERVICE_NAME } from './utils'
import {
    RackspaceBidHistoryEndpoint,
    RackspaceMetaInfoEndpoint,
    RackspaceResponseTimeEndpoint,
} from './rackspace'
import { instrument, ResolveConfigFn } from '@microlabs/otel-cf-workers'

declare const PRODUCTION: string

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
    await next()
    WriteDataPoint(c, c.error)
})

app.get('/git/repos', GithubRepos)
app.get('/git/user', GithubUser)
app.post('/misc/gravatar', GravatarHash)
app.get('/misc/gravatar/:email', GravatarHash)
app.all('/encrypted_resume', EncryptResumeEndpoint)
app.get(`${RedirectPath}`, RedirectLanding)
app.get(`${RedirectPath}/`, RedirectLanding)
app.get(`${RedirectPath}/:short_link`, Redirects)
app.get('/cf', CFEndpoint)
app.get('/version', VersionEndpoint)
app.get('/trace', TraceEndpoint)
app.get('/ip', IPEndpoint)
app.get('/pypy/checksums/:filename', PyPyChecksumsEndpoint)
app.get('/cloudflare_api/:target', CloudflareAPIEndpoint)
app.get('/download_proxy/', DownloadProxyEndpoint)
app.get('/download_proxy/:program', DownloadProxyEndpoint)
app.get('/rackspace/bid_history/:server_class', RackspaceBidHistoryEndpoint)
app.get('/rackspace/response_time', RackspaceResponseTimeEndpoint)
app.get('/rackspace/meta/:choice', RackspaceMetaInfoEndpoint)
app.get('/health', HealthEndpoint)
app.post('/cron', TriggerCron)
app.all('/v1/traces', async (c: DefinedContext) => {
    return c.html('ok')
})
app.all(`${CORS_ENDPOINT}`, CORSHandle)

if (PRODUCTION === 'true') {
    app.all('/', async (c: DefinedContext) => {
        return c.redirect('https://cyberjake.xyz/', 301)
    })
}
app.all('*', (c: DefinedContext) => {
    console.log(c.req.header())
    if (c.req.header('accept')?.includes('application/json')) {
        return JSONAPIResponse(
            { error: 'Not Found' },
            { status: 404, error: 'Not Found', success: false }
        )
    }

    return c.notFound()
})

app.onError((err, c) => {
    console.error(JSON.stringify(err))
    WriteDataPoint(c, err)
    return JSONAPIResponse(
        { error: err.message, stack: err.stack },
        { status: 500, error: err.message, success: false }
    )
})

const handler = {
    fetch: app.fetch,
    scheduled(_: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        ctx.waitUntil(ScrapeCloudflareAPISettings(env, ctx))
    },
}

const config: ResolveConfigFn = (env: Env) => {
    if (env.AXIOM_API_TOKEN === undefined) {
        return {
            exporter: {
                url: 'https://api.cyberjake.xyz/v1/traces',
                headers: {},
            },
            service: { name: 'axiom-cloudflare-workers' },
        }
    }
    return {
        exporter: {
            url: 'https://api.axiom.co/v1/traces',
            headers: {
                Authorization: `Bearer ${env.AXIOM_API_TOKEN || ''}`,
                'X-Axiom-Dataset': SERVICE_NAME,
            },
        },
        service: { name: 'axiom-cloudflare-workers' },
    }
}

export default instrument(handler, config)

// export default handler
