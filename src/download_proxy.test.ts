import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Download proxy ', () => {
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

    it('Missing program', async () => {
        const resp = await worker.fetch('/download_proxy/')
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe('program is required')
    })
    it('Invalid program', async () => {
        const resp = await worker.fetch('/download_proxy/not_a_program')
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe(
            "program 'not_a_program; is not supported"
        )
    })

    it('Missing version', async () => {
        const resp = await worker.fetch('/download_proxy/maven')
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe('version is required')
    })

    it('Valid version', async () => {
        const resp = await worker.fetch('/download_proxy/maven?version=3.9.3')
        expect(resp.status).toBe(200)
        const resp2 = await worker.fetch('/download_proxy/maven?version=3.9.3')
        expect(resp2.status).toBe(200)
        expect(resp2.headers.get('cf-cache-status')).toBe('HIT')
    })

    it('Missing version', async () => {
        const resp = await worker.fetch('/download_proxy/maven?version=1.0.0')
        expect(resp.status).toBe(404)
    })
})
