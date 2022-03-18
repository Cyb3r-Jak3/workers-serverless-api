import { JSONResponse } from './utils'

interface GravatarRequestBody {
    email: string
}

function hex(buffer: ArrayBuffer): string {
    const hexCodes = []
    const view = new DataView(buffer)
    for (let i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        const value = view.getUint32(i)
        // toString(16) will give the hex representation of the number without padding
        const stringValue = value.toString(16)
        // We use concatenation and slice for padding
        const padding = '00000000'
        const paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue)
    }
    // Join all the hex strings into one

    return hexCodes.join('')
}

async function GenerateHash(email: string): Promise<string> {
    return hex(
        await crypto.subtle.digest(
            'md5',
            new TextEncoder().encode(email.trim().toLowerCase())
        )
    )
}

export async function GravatarHash(req: Request): Promise<Response> {
    switch (req.method.toUpperCase()) {
        case 'POST': {
            const request: GravatarRequestBody = await req.json()
            return JSONResponse({ hash: await GenerateHash(request.email) })
        }
        case 'GET': {
            const redirectURL = new URL(req.url)
            const redirectSelection = redirectURL.pathname.replace(
                '/misc/gravatar/',
                ''
            )
            console.log(redirectSelection)

            return new Response(await GenerateHash(redirectSelection))
        }
        default: {
            return new Response('Only GET and POST are allowed', {
                status: 405,
            })
        }
    }
}
