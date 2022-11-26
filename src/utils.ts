import { Context, Handler } from 'hono'

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
