import { Context } from 'hono'
import { JSONResponse } from '@cyb3r-jak3/workers-common'

export async function CFEndpoint(c: Context): Promise<Response> {
    return JSONResponse(c.req.cf)
}

export async function VersionEndpoint(c: Context): Promise<Response> {
    let gitHash = c.env.GitHash
    if (!gitHash) {
        gitHash = 'dev'
    }
    let buildTime = c.env.BuildTime
    if (!buildTime) {
        buildTime = new Date().toString()
    }
    return JSONResponse(
        { GitHash: gitHash, BuiltTime: buildTime },
        { extra_headers: { 'Cache-Control': 'public, max-age=3600' } }
    )
}
