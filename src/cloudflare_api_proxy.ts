import {
    JSONResponse,
    JSONAPIErrorResponse,
    HandleCachedResponse,
} from '@cyb3r-jak3/workers-common'
import type { Context } from 'hono'
import type { ENV } from './index'

type targetType = {
    name: string
    endpoint: string
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
]

export async function CloudflareAPIEndpoint(c: Context): Promise<Response> {
    const cache = caches.default
    let resp = await cache.match(c.req.raw)
    if (resp) {
        return HandleCachedResponse(resp)
    }
    const target = c.req.param('target')
    if (!target) {
        return JSONAPIErrorResponse('Target is required', 400)
    }

    const data = await c.env.KV.get(`API_DATA_${target}`, { type: 'json' })
    if (!data) {
        return JSONResponse({}, { status: 404 })
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
        return
    }

    for (const target of apiTargets) {
        const url = (baseURL + target.endpoint).replace(
            ':account_id',
            env.ScrapeAccountID
        )
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.ScrapeToken}`,
            },
        })
        if (response.status !== 200) {
            console.error(
                `Did not get 200 error. Got ${
                    response.status
                }: ${await response.text()}`
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
