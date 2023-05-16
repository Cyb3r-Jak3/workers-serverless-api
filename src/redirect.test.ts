import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Redirect Endpoints', () => {
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

    it('List Redirects', async () => {
        const resp = await worker.fetch('/redirects')
        expect(resp.status).toBe(200)
    })

    it('Get Redirected', async () => {
        const resp = await worker.fetch('/redirects/blog')
        expect(resp.redirected).toEqual(true)
    })

    it('Missing redirect', async () => {
        const resp = await worker.fetch('/redirects/missing')
        expect(resp.status).toBe(404)
        expect(await resp.text()).toEqual(
            "You requested redirect 'missing' and it does not exist"
        )
    })
})
