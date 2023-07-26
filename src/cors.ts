import { HandleCachedResponse, HandleCORS } from '@cyb3r-jak3/workers-common'
import { Context } from 'hono'
export const CORS_ENDPOINT = '/cors'

const Allowed: string[] = [
    'api.cloudflare.com/schemas.json',
    'developers.cloudflare.com/schema',
]
const AllowedOrigins: string[] = [
    'cf-api.cyberjake.xyz',
    'cloudflare-api-pretty.pages.dev',
    'localhost:8788',
]

export async function CORSHandle(c: Context): Promise<Response> {
    const cache = caches.default
    const req = c.req
    let response = await cache.match(req.raw)

    if (response) {
        return HandleCachedResponse(response)
    }
    // Handle Options
    if (req.method == 'OPTIONS') {
        return HandleCORS(req.raw)
    }

    const givenURL = c.req.query('api_url')
    const givenWildCard = c.req.query('allow_wild')
    const givenOrigin = c.req.query('allowed_origin')
    console.log(givenURL, givenWildCard, givenOrigin)
    if (!givenURL || !givenOrigin) {
        return new Response(null, { status: 404 })
    }

    let originSet = false

    for (const allowed_url of Allowed) {
        if (allowed_url == givenURL) {
            const full_url = `https://${allowed_url}`
            const cors_req = new Request(full_url, req.raw)

            cors_req.headers.set('Origin', new URL(full_url).origin)

            const cors_resp = await fetch(cors_req)
            response = new Response(cors_resp.body, cors_resp)

            if (givenWildCard === 'true') {
                response.headers.set('Access-Control-Allow-Origin', '*')
                originSet = true
            } else if (givenOrigin !== null) {
                for (const allowed_origin of AllowedOrigins) {
                    if (new URL(givenOrigin).host === allowed_origin) {
                        response.headers.set(
                            'Access-Control-Allow-Origin',
                            givenOrigin
                        )
                        originSet = true
                    }
                }
            } else {
                response.headers.set(
                    'Access-Control-Allow-Origin',
                    new URL(c.req.url).origin
                )
                originSet = true
            }
            response.headers.append('Vary', 'Origin')
        }
    }
    if (!originSet) {
        response = new Response(`Origin is not allowed`, {
            status: 400,
        })
    }

    if (!response) {
        response = new Response(`API URL '${givenURL}' is not allowed`, {
            status: 400,
        })
    }

    if (response.status !== 404) {
        response.headers.set('cache-control', 'max-age=3600')
        // c.executionCtx.waitUntil(cache.put(req.raw.url, response.clone()))
        // Fix for https://github.com/cloudflare/miniflare/issues/527
        // Can't upgrade until https://github.com/cloudflare/miniflare/issues/454
        c.executionCtx.waitUntil(
            cache.put(req.url, new Response(undefined, response))
        )
    }
    return response
}
