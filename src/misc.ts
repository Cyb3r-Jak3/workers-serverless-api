import { HandleCachedResponse, JSONResponse } from './utils'
import { Context } from 'hono'
const cache = caches.default

interface GravatarRequestBody {
    email: string
}

/**
 * Turns the array buffer from crypto into a string. Stolen from stackoverflow
 * @param buffer Crypto Buffer
 * @returns Hex string
 */
function hex(buffer: ArrayBuffer): string {
    const hexCodes = []
    const view = new DataView(buffer)
    for (let i = 0; i < view.byteLength; i += 4) {
        //Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        // const value =
        // toString(16) will give the hex representation of the number without padding
        const stringValue = view.getUint32(i).toString(16)
        // We use concatenation and slice for padding
        const padding = '00000000'
        const paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue)
    }
    // Join all the hex strings into one

    return hexCodes.join('')
}

/**
 * Generates a MD5 hash from an email
 * @param email Email address
 * @returns MD5 Hash
 */
async function GenerateHash(email: string): Promise<string> {
    return hex(
        await crypto.subtle.digest(
            'md5',
            new TextEncoder().encode(email.trim().toLowerCase())
        )
    )
}

export async function GravatarHash(c: Context): Promise<Response> {
    const req = c.req
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
    await cache.put(req, response.clone())
    return response
}
