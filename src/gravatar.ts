import {
    HandleCachedResponse,
    JSONResponse,
    GenerateHash,
} from '@cyb3r-jak3/workers-common'
import { Context } from 'hono'

interface GravatarRequestBody {
    email: string
}

export async function GravatarHash(c: Context): Promise<Response> {
    const req = c.req
    const cache = caches.default

    let response = await cache.match(req)
    if (response) {
        return HandleCachedResponse(response)
    }
    switch (req.method.toUpperCase()) {
        case 'POST': {
            const request: GravatarRequestBody = await req.json()
            if (!request.email) {
                return c.notFound()
            }
            response = JSONResponse({
                hash: await GenerateHash(request.email, 'md5'),
            })
            break
        }
        case 'GET': {
            const email = c.req.param('email')
            if (!email) {
                return c.notFound()
            }
            response = new Response(await GenerateHash(email, 'md5'))
            break
        }
        default: {
            response = new Response('Only GET and POST are allowed', {
                status: 405,
            })
        }
    }
    response.headers.set('Cache-Control', 'public, max-age=86400')
    c.executionCtx.waitUntil(cache.put(req, response.clone()))
    return response
}
