import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Worker dev', () => {
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

    it('Index 404', async () => {
        const resp = await worker.fetch('/')
        expect(resp.status).toBe(404)
    })
})

describe('Worker Prod', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
            env: 'production',
            local: true,
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('Index Redirect', async () => {
        const resp = await worker.fetch('/')
        expect(resp.redirected).toEqual(true)
    })
})
