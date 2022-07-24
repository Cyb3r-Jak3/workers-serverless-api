import { HandleCachedResponse, HandleOptions } from './utils'
import { Context } from 'hono'
export const CORS_ENDPOINT = '/cors'

const Allowed: string[] = ['api.cloudflare.com/schemas.json']

const cache = caches.default

export async function CORSHandle(c: Context): Promise<Response> {
    const req = c.req
    // Find request in cache
    let response = await cache.match(req)

    if (response) {
        return HandleCachedResponse(response)
    }
    // Handle CORS
    if (req.method == 'OPTIONS') {
        return HandleOptions(req)
    }
    const url = new URL(req.url)
    const apiUrl = url.searchParams.get('api_url')
    const allowWildCard = url.searchParams.get('allow_wild')
    if (!apiUrl) {
        response = new Response(null, { status: 404 })
    }
    if (!response) {
        for (const allowed_url of Allowed) {
            console.log(allowed_url)
            if (allowed_url == apiUrl) {
                const full_url = `https://${allowed_url}`
                const cors_req = new Request(full_url, req)
                cors_req.headers.set('Origin', new URL(full_url).origin)
                const cors_resp = await fetch(cors_req)
                response = new Response(cors_resp.body, cors_resp)
                if (allowWildCard === 'true') {
                    response.headers.set('Access-Control-Allow-Origin', '*')
                } else {
                    response.headers.set(
                        'Access-Control-Allow-Origin',
                        url.origin
                    )
                }
                response.headers.append('Vary', 'Origin')
            }
        }
    }

    if (!response) {
        console.log('Setting 400 response')
        response = new Response(`API URL '${apiUrl}' is not allowed`, {
            status: 400,
        })
    }

    if (response.status !== 404) {
        await cache.put(req, response.clone())
    }
    response.headers.set('X-Worker-Cache', 'Miss')
    return response
}
