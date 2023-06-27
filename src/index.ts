import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './gravatar'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'
import { CORSHandle, CORS_ENDPOINT } from './cors'
import { Hono } from 'hono'
import { EncryptResumeEndpoint } from './resume'
import { VersionEndpoint, CFEndpoint } from './misc'
import { WriteDataPoint } from './utils'
import { PyPyChecksumsEndpoint } from './pypy'
import {
    ScrapeCloudflareAPISettings,
    CloudflareAPIEndpoint,
} from './cloudflare_api_proxy'
import { MavenDownloadEndpoint } from './download_proxy'
declare const PRODUCTION: string

export type ENV = {
    KV: KVNamespace
    AE: AnalyticsEngineDataset
    GitHash: string
    BuildTime: string
    ScrapeToken?: string
    ScrapeAccountID?: string
    PUBLIC_FILES: R2Bucket
}

const app = new Hono<{ Bindings: ENV }>()

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
app.get('/pypy/checksums/:filename', PyPyChecksumsEndpoint)
app.get('/cloudflare_api/:target', CloudflareAPIEndpoint)
app.get('/download_proxy/', MavenDownloadEndpoint)
app.get('/download_proxy/:program', MavenDownloadEndpoint)
app.all(`${CORS_ENDPOINT}`, CORSHandle)

if (PRODUCTION === 'true') {
    app.all('/', async (c) => {
        return c.redirect('https://cyberjake.xyz/', 301)
    })
}
app.all('*', (c) => c.notFound())

export default {
    fetch: app.fetch,
    async scheduled(_: ScheduledEvent, env: ENV, ctx: ExecutionContext) {
        ctx.waitUntil(ScrapeCloudflareAPISettings(env, ctx))
    },
}
