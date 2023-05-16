import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Misc Endpoints', () => {
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

    it('CF JSON Endpoint', async () => {
        const resp = await worker.fetch('/cf')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
    it('Version Endpoint', async () => {
        const resp = await worker.fetch('/version')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        const json_resp = await resp.json()
        expect(json_resp['results']['GitHash']).toEqual('dev')
        expect(json_resp['results']['BuiltTime']).toEqual('now')
    })
})
