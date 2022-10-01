import { Context, Handler } from 'hono'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
}

interface JSONResponseOptions {
    status?: number
    extra_headers?: Record<string, string>
}

/**
 * Creates a JSON response
 * @param ResponseData Object to turn into JSON data
 * @param options Extra options for
 * @returns JSON Response
 */
export function JSONResponse(
    ResponseData: string | unknown,
    options?: JSONResponseOptions
): Response {
    let status
    if (options === undefined || options.status === undefined) {
        status = 200
    } else {
        status = options.status
    }
    const send_headers = new Headers({
        'content-type': 'application/json; charset=UTF-8',
    })
    if (options?.extra_headers) {
        for (const key of Object.keys(options.extra_headers)) {
            send_headers.append(key, options.extra_headers[key])
        }
    }
    return new Response(JSON.stringify(ResponseData), {
        status: status,
        headers: send_headers,
    })
}

/**
 * Simple wrapper for making JSON responses with error status codes
 * @param errMessage String or object to turn into JSON
 * @param status HTTP status code to return. Defaults to 500
 * @returns
 */
export function JSONErrorResponse(errMessage: string, status = 500): Response {
    return JSONResponse({ Error: errMessage }, { status: status })
}

/**
 * Handles any CORs requests
 * @param request Incoming request to handle CORs for
 * @returns CORs response
 */
export function HandleOptions(request: Request): Response {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers
    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        // If you want to check or reject the requested method + headers
        // you can do that here.

        return new Response(null, {
            headers: corsHeaders,
        })
    } else {
        // Handle standard OPTIONS request.
        // If you want to allow other HTTP Methods, you can do that here.
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, OPTIONS',
            },
        })
    }
}

/**
 *
 * @param resp Response that hit cache
 * @returns Response with X-Worker-Cache Header
 */

export function HandleCachedResponse(resp: Response): Response {
    const newHeaders = new Headers(resp.headers)
    newHeaders.set('X-Worker-Cache', 'HIT')
    return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: newHeaders,
    })
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
export async function GenerateHash(email: string): Promise<string> {
    return hex(
        await crypto.subtle.digest(
            'md5',
            new TextEncoder().encode(email.trim().toLowerCase())
        )
    )
}

/*
Data input format
 - Date
 - URL
 - HTTP Protocol
 - Error
 - Response code
 - User Agent
 - Referer
 - ASN
 - Colo
 - Country
 - TLS Version
 - ClientTrustScore
 - Worker Cache Hit Header
*/

function WriteDataPoint(c: Context, error = ''): void {
    if (c.env.PRODUCTION !== 'true') {
        return
    }
    const req = c.req
    const AE: AnalyticsEngine = c.env.AE
    AE.writeDataPoint({
        blobs: [
            new Date().toUTCString(),
            req.url,
            req.cf?.httpProtocol || 'invalid',
            error,
            req.headers.get('user-agent'),
            req.headers.get('referer'),
            req.cf?.colo || 'missing colo',
            req.cf?.country || 'missing country',
            req.cf?.tlsVersion || 'invalid TLS',
            c.res.headers.get('X-Worker-Cache'),
        ],
        doubles: [
            c.res.status,
            req.cf?.asn || 0,
            req.cf?.clientTrustScore || 0,
        ],
    })
}

export const LogToAE: Handler = async (c, next) => {
    try {
        await next()
        WriteDataPoint(c)
    } catch (error) {
        WriteDataPoint(c, error)
    }
}

// This does not exist in Cloudflare types yet
export interface AnalyticsEngine {
    writeDataPoint(event: AnalyticsEngineEvent): void
}

export interface AnalyticsEngineEvent {
    readonly doubles?: number[]
    readonly blobs?: (ArrayBuffer | string | null)[]
}
