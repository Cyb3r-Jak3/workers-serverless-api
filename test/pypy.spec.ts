import {
    env,
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('PyPy Endpoints', () => {
    it('PyPy All', async () => {
        const resp = await SELF.fetch('https://localhost/pypy/checksums/all')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toBeGreaterThanOrEqual(329)
        const kv_data = await env.KV.get('pypy_checksums_all')
        console.log('PyPy All', kv_data)
        expect(kv_data).toBeDefined()
    })
    it('PyPy Version', async () => {
        const resp = await SELF.fetch('https://localhost/pypy/checksums/pypy3.9-v7.3.11')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(9)
    })
    it('PyPy 3.10 Version', async () => {
        const resp = await SELF.fetch('https://localhost/pypy/checksums/pypy3.10-v7.3.12')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(9)
    })
    it('PyPy File', async () => {
        const resp = await SELF.fetch('https://localhost/pypy/checksums/pypy3.9-v7.3.11-src.tar.bz2')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(1)
    })
})
