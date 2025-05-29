import { Context } from 'hono'
/*
Data input format
 - Date
 - URL
 - IP 
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
declare const PRODUCTION: string

export function WriteDataPoint(c: Context, error: Error | undefined): void {
    if (!c.env || PRODUCTION !== 'true') {
        return
    }
    if (!c.env.AE) {
        console.error('Analytics Engine is not defined')
        return
    }
    const req = c.req.raw
    if (req.headers.get('user-agent')?.toLowerCase() === 'cyb3r uptime') {
        return
    }
    c.env.AE.writeDataPoint({
        blobs: [
            new Date().toUTCString(),
            req.url,
            req.headers.get('x-real-ip'),
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
            req.cf?.botManagement.score || -1,
        ],
    })
}

export const SERVICE_NAME = 'serverless-api'
