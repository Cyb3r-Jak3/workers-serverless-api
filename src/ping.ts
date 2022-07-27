import { Context } from 'hono'
import { JSONResponse } from './utils'

export async function PingEndpoint(c: Context): Promise<Response> {
    let gitHash = c.env.GitHash
    if (!gitHash) {
        gitHash = 'dev'
    }
    const CF_headers = JSON.parse(JSON.stringify(c.req.cf))
    CF_headers['gitHash'] = gitHash
    return JSONResponse(CF_headers)
}
