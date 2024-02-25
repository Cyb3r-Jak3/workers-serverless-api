import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'

describe('Misc Endpoints', () => {
    it('CF JSON Endpoint', async () => {
        const request = new Request('https://localhost/cf')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
    it('Version Endpoint', async () => {
        const request = new Request('https://localhost/version')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp['results']['GitHash']).toEqual('dev')
        expect(json_resp['results']['BuiltTime']).toEqual('thePast')
    })
    it('Trace Endpoint', async () => {
        const request = new Request('https://localhost/trace')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp['success']).toEqual(true)
    })
    it('IP Endpoint', async () => {
        const request = new Request('https://localhost/ip')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('text/plain')
    })
    it('IP Endpoint JSON', async () => {
        const request = new Request('https://localhost/ip?format=json')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
})
