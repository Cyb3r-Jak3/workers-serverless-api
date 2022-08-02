import { Context } from 'hono'
import { JSONResponse } from './utils'

export async function CFEndpoint(c: Context): Promise<Response> {
    return JSONResponse(c.req.cf)
}

export async function VersionEndpoint(c: Context): Promise<Response> {
    const headers: any = {};
    let gitHash = c.env.GitHash
    if (!gitHash) {
        gitHash = 'dev'
    }
    headers["GitHash"] = gitHash
    let buildTime = c.env.BuildTime
    if (!buildTime) {
        buildTime =  new Date().toString()
    }
    headers["BuildTime"] = buildTime
    return JSONResponse(headers)
}