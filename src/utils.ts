import { Context } from 'hono'
import type { Handler } from 'hono/dist/types/types'
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
    if (!c.env || c.env.PRODUCTION !== 'true') {
        return
    }
    const req = c.req
    if (req.headers.get('user-agent')?.toLowerCase() === 'cyb3r uptime') {
        return
    }
    c.env.AE.writeDataPoint({
        blobs: [
            new Date().toUTCString(),
            new URL(req.url).pathname,
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
            req.cf?.botManagement.score || 0,
        ],
    })
}

export const LogToAE: Handler = async (c, next) => {
    try {
        await next()
        WriteDataPoint(c)
    } catch (error) {
        try {
            WriteDataPoint(c, error)
        } catch (error) {
            console.log(`Error writing data point - ${error}`)
            return new Response('Uncaught AE error', { status: 500 })
        }
    }
}
