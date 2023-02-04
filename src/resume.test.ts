import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Resume Endpoints', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('GET Request', async () => {
        const resp = await worker.fetch('/encrypted_resume')
        expect(resp.status).toBe(405)
    })

    it('Missing Resume', async () => {
        const resp = await worker.fetch('/encrypted_resume', { method: 'POST' })
        expect(resp.status).toBe(400)
    })

    it('Working Resume', async () => {
        const resume_resp = await fetch(
            'https://raw.githubusercontent.com/Cyb3r-Jak3/portfolio/main/static/files/jake%40jwhite.network.asc'
        )
        if (resume_resp.status !== 200) {
            throw new Error(
                `Unable to get key. Got HTTP status ${resume_resp.status}`
            )
        }
        console.log(resume_resp.status)
        const resume: Blob = await resume_resp.blob()
        const formdata = new FormData()
        formdata.append('key', resume)
        const resp = await worker.fetch('/encrypted_resume', {
            method: 'POST',
            body: formdata,
        })
        expect(resp.status).toBe(200)
    })
})
