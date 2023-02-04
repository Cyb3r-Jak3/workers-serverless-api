import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Gravatar Endpoints', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('Missing GET Gravatar', async () => {
        const resp = await worker.fetch('/misc/gravatar/')
        expect(resp.status).toBe(404)
    })

    it('GET Gravatar', async () => {
        const resp = await worker.fetch('/misc/gravatar/git@cyberjake.xyz')
        expect(resp.status).toBe(200)
        expect(await resp.text()).toBe('defe57d080afd413dd389cab9556355c')
    })

    it('Missing POST Gravatar', async () => {
        const resp = await worker.fetch('/misc/gravatar/', { method: 'POST' })
        expect(resp.status).toBe(404)
    })

    it('Missing POST Gravatar', async () => {
        const resp = await worker.fetch('/misc/gravatar', {
            method: 'POST',
            body: JSON.stringify({ email: 'git@cyberjake.xyz' }),
        })
        expect(resp.status).toBe(200)
        const json_resp = await resp.json()
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        expect(json_resp['results']['hash']).toEqual(
            'defe57d080afd413dd389cab9556355c'
        )
    })
})
