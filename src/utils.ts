import { Context, Handler } from 'hono'

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
