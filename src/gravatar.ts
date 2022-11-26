import { GenerateHash } from './utils'
import { HandleCachedResponse, JSONResponse} from '@cyb3rjak3/common'
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
            response = JSONResponse({ hash: await GenerateHash(request.email) })
            break
        }
        case 'GET': {
            const parsedData = new URL(req.url).pathname.replace(
                '/misc/gravatar/',
                ''
            )
            response = new Response(await GenerateHash(parsedData))
            break
        }
        default: {
            response = new Response('Only GET and POST are allowed', {
                status: 405,
            })
        }
    }
    response.headers.set('Cache-Control', 'public, max-age=3600')
    await cache.put(req, response.clone())
    return response
}
