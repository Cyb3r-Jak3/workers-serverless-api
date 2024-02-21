import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'

describe('PyPy Endpoints', () => {
    it('PyPy All', async () => {
        const request = new Request('https://localhost/pypy/checksums/all')
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toBeGreaterThanOrEqual(329)
    })
    it('PyPy Version', async () => {
        const request = new Request(
            'https://localhost/pypy/checksums/pypy3.9-v7.3.11'
        )
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(9)
    })
    it('PyPy 3.10 Version', async () => {
        const request = new Request(
            'https://localhost/pypy/checksums/pypy3.10-v7.3.12'
        )
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(9)
    })
    it('PyPy File', async () => {
        const request = new Request(
            'https://localhost/pypy/checksums/pypy3.9-v7.3.11-src.tar.bz2'
        )
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(1)
    })
})
