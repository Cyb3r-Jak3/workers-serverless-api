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
    const httpbin_resp = await fetch('https://httpbin.org/headers', {
        headers: {
            'User-Agent': 'Cyb3rJak3 API',
        },
    })
    const trace_endpoint_resp = await fetch(
        'https://cloudflare.com/cdn-cgi/trace',
        {
            headers: {
                'User-Agent': 'Cyb3rJak3 API',
            },
        }
    )
    const trace_text: string = await trace_endpoint_resp.text()
    const trace_obj: Record<string, string> = {}
    trace_text.split('\n').forEach((element) => {
        const [key, value] = element.split('=')
        trace_obj[key] = value
    })
    const resp = {
        httpbin: await httpbin_resp.json(),
        trace_endpoint: trace_obj,
    }
    return JSONAPIResponse(resp)
}
