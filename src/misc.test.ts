import { env, SELF, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it} from 'vitest'
import worker from '../src/index'

describe('Misc Endpoints', () => {
    it('CF JSON Endpoint', async () => {
        const request = new Request('https://localhost/cf')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('application/json; charset=UTF-8')
    })
    it('Version Endpoint', async () => {
        const request = new Request('https://localhost/version')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('application/json; charset=UTF-8')
        const json_resp = await resp.json()
        expect(json_resp['results']['GitHash']).toEqual('ThisVersion')
        expect(json_resp['results']['BuiltTime']).toEqual('thePast')
    })
    it('Trace Endpoint', async () => {
        const request = new Request('https://localhost/trace')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('application/json; charset=UTF-8')
        const json_resp = await resp.json()
        expect(json_resp['success']).toEqual(true)
    })
    it('IP Endpoint', async () => {
        const request = new Request('https://localhost/ip')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('text/plain')
    })
    it('IP Endpoint JSON', async () => {
        const request = new Request('https://localhost/ip?format=json')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('application/json; charset=UTF-8')
    })
})
