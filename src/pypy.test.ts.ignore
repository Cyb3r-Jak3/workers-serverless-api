import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('PyPy Endpoints', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
            local: true,
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('PyPy All', async () => {
        const resp = await worker.fetch('/pypy/checksums/all')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toBeGreaterThanOrEqual(329)
    })

    it('PyPy Version', async () => {
        const resp = await worker.fetch('/pypy/checksums/pypy3.9-v7.3.11')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(9)
    })
    it('PyPy 3.10 Version', async () => {
        const resp = await worker.fetch('/pypy/checksums/pypy3.10-v7.3.12')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(9)
    })

    it('PyPy File', async () => {
        const resp = await worker.fetch(
            '/pypy/checksums/pypy3.9-v7.3.11-src.tar.bz2'
        )
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp.results.length).toEqual(1)
    })
})
