import {
    env,
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('Misc Endpoints', () => {
    it('CF JSON Endpoint', async () => {
        const resp = await SELF.fetch('https://localhost/cf')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
    it('Version Endpoint', async () => {
        const resp = await SELF.fetch('https://localhost/version')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp['results']['GitHash']).toEqual('dev')
        expect(json_resp['results']['BuiltTime']).toEqual('now')
    })
    it('Trace Endpoint', async () => {
        const resp = await SELF.fetch('https://localhost/trace')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp['success']).toEqual(true)
    })
    it('IP Endpoint', async () => {
        const resp = await SELF.fetch('https://localhost/ip')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual('text/plain')
    })
    it('IP Endpoint JSON', async () => {
        const resp = await SELF.fetch('https://localhost/ip?format=json')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
})
