import {
    JSONResponse,
    JSONAPIErrorResponse,
    HandleCachedResponse,
} from '@cyb3r-jak3/workers-common'
import type { DefinedContext, ENV } from './types'

type targetType = {
    name: string
    endpoint: string
}
type apiPermission = {
    id: string
    name: string
    description: string
    scopes: string[]
}

const apiTargets: targetType[] = [
    {
        name: 'token_permissions',
        endpoint: '/user/tokens/permission_groups',
    },
    {
        name: 'alert_types',
        endpoint: '/accounts/:account_id/alerting/v3/available_alerts',
    },
    {
        name: 'account_rulesets',
        endpoint: '/accounts/:account_id/rulesets',
    },
    {
        name: 'zone_rulesets',
        endpoint: '/zones/:zone_id/rulesets',
    },
]

export async function CloudflareAPIEndpoint(
    c: DefinedContext
): Promise<Response> {
    const cache = caches.default
    let resp = await cache.match(c.req.raw.url)
    if (resp) {
        return HandleCachedResponse(resp)
    }
    const target = c.req.param('target')
    if (!target) {
        return JSONAPIErrorResponse('Target is required', 400)
    }

    let data = await c.env.KV.get(`API_DATA_${target}`, { type: 'json' })
    if (!data) {
        return JSONResponse({}, { status: 404 })
    }
    const scope = c.req.query('scope')
    if (target === 'token_permissions' && scope) {
        const scope_map: { [key: string]: string } = {
            r2: 'com.cloudflare.edge.r2.bucket',
            account: 'com.cloudflare.api.account',
            zone: 'com.cloudflare.api.account.zone',
            user: 'com.cloudflare.api.user',
        }
        if (!scope_map[scope]) {
            return JSONAPIErrorResponse(
                `Invalid scope. Valid scopes are: ${Object.keys(scope_map).join(
                    ', '
                )}`,
                400
            )
        }
        data = data.filter(
            (x: apiPermission) => x.scopes[0] === scope_map[scope]
        )
    }
    resp = JSONResponse(data, {
        extra_headers: { 'Cache-Control': 'public, max-age=3600' },
    })
    c.executionCtx.waitUntil(cache.put(c.req.raw, resp.clone()))
    return resp
}

export async function ScrapeCloudflareAPISettings(
    env: ENV,
    ctx: ExecutionContext
) {
    if (!env.ScrapeToken || !env.ScrapeAccountID) {
        return
    }
    const baseURL = 'https://api.cloudflare.com/client/v4'
    const verify = await fetch(baseURL + '/user/tokens/verify', {
        headers: {
            Authorization: `Bearer ${env.ScrapeToken}`,
        },
    })

    if (verify.status !== 200) {
        console.error(
            `Did not get 200 error for verification. Got ${
                verify.status
            }: ${await verify.text()}`
        )
        throw new Error('Invalid token')
    }

    for (const target of apiTargets) {
        const url = (baseURL + target.endpoint)
            .replace(':account_id', env.ScrapeAccountID)
            .replace(':zone_id', env.ScrapeZoneID)
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.ScrapeToken}`,
            },
        })
        if (response.status !== 200) {
            console.error(
                `Did not get 200 status. Got ${
                    response.status
                }: ${await response.text()} for ${target.name} at ${url}`
            )
            continue
        }
        const resp_json = await response.json()
        ctx.waitUntil(
            env.KV.put(
                `API_DATA_${target.name}`,
                JSON.stringify(resp_json['result'])
            )
        )
    }
}
