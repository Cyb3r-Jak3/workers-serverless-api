import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('CORS ', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('Valid CORS', async () => {
        const resp = await worker.fetch(
            '/cors?api_url=developers.cloudflare.com/schema&allowed_origin=http://localhost:8788'
        )
        expect(resp.status).toBe(200)
    })

    it('No API URL', async () => {
        const resp = await worker.fetch(
            '/cors?allowed_origin=http://localhost:8788'
        )
        expect(resp.status).toBe(404)
    })

    it('Invalid Allowed Origin', async () => {
        const resp = await worker.fetch(
            '/cors?api_url=developers.cloudflare.com/schema&allowed_origin=https://google.com'
        )
        expect(resp.status).toBe(400)
    })

    it('Invalid Allowed URL', async () => {
        const resp = await worker.fetch(
            '/cors?api_url=google.com&allowed_origin=https://google.com'
        )
        expect(resp.status).toBe(400)
    })
})
