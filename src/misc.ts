import { JSONResponse, JSONAPIResponse } from '@cyb3r-jak3/workers-common'
import { DefinedContext } from './types'
import { ScrapeCloudflareAPISettings } from './cloudflare_api_proxy'

export async function CFEndpoint(c: DefinedContext): Promise<Response> {
    return JSONResponse({
        headers: Object.fromEntries(c.req.raw.headers.entries()),
        cf: c.req.raw.cf,
    })
}

export async function VersionEndpoint(c: DefinedContext): Promise<Response> {
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

export async function IPEndpoint(c: DefinedContext): Promise<Response> {
    const ip = c.req.header('CF-Connecting-IP')
    if (c.req.query('format') == 'json') {
        return JSONResponse({ ip })
    }
    return new Response(ip, {
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}

export async function HealthEndpoint(c: DefinedContext): Promise<Response> {
    let status: 'ok' | 'error' = 'error'
    try {
        status =
            c.env !== undefined &&
            c.env.KV !== undefined &&
            c.env.PUBLIC_FILES !== undefined
                ? 'ok'
                : 'error'
    } catch (e) {
        console.error('Health check failed:', e)
    }
    if (
        c.req.query('format') === 'json' ||
        c.req.header('accept')?.includes('application/json')
    ) {
        return JSONResponse(
            { status: status },
            { status: status === 'ok' ? 200 : 500 }
        )
    }
    return new Response(status, {
        headers: {
            'Content-Type': 'text/plain',
        },
        status: status === 'ok' ? 200 : 500,
    })
}

export async function TriggerCron(c: DefinedContext): Promise<Response> {
    c.executionCtx.waitUntil(
        ScrapeCloudflareAPISettings(c.env, c.executionCtx as ExecutionContext)
    )
    return JSONAPIResponse({ status: 'ok' }, { status: 200, success: true })
}
