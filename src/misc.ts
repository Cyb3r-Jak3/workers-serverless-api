import type { Context } from 'hono'
import { JSONResponse } from '@cyb3r-jak3/workers-common'

export async function CFEndpoint(c: Context): Promise<Response> {
    return JSONResponse(c.req.raw.cf)
}

export async function VersionEndpoint(c: Context): Promise<Response> {
    return JSONResponse({
        GitHash: c.env.GitHash ?? 'dev',
        BuiltTime: c.env.buildTime ?? 'now',
    })
}
