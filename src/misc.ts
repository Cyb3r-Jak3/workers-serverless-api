import type { Context } from 'hono'
import { JSONResponse, JSONAPIResponse } from '@cyb3r-jak3/workers-common'

export async function CFEndpoint(c: Context): Promise<Response> {
    return JSONResponse({
        headers: Object.fromEntries(c.req.raw.headers.entries()),
        cf: c.req.raw.cf,
    })
}

export async function VersionEndpoint(c: Context): Promise<Response> {
    return JSONAPIResponse({
        GitHash: c.env.GitHash ?? 'dev',
        BuiltTime: c.env.buildTime ?? 'now',
    })
}
