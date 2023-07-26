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
        BuiltTime: c.env.BuiltTime ?? 'now',
    })
}

export async function TraceEndpoint(): Promise<Response> {
    const resp = await fetch('https://api.cyberjake.xyz/cf', {
        headers: {
            'User-Agent': 'Myself Cyb3rJak3 API',
        },
    })
    // console.log(resp.statusText)
    return JSONAPIResponse(await resp.json())
}
