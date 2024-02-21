import { env, SELF, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it} from 'vitest'
import worker from '../src/index'

describe('Resume Endpoints', () => {
    it('GET Request', async () => {
        const request = new Request('https://localhost/encrypted_resume')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(405)
    })
    it('Missing Resume', async () => {
        const request = new Request('https://localhost/encrypted_resume', {
            method: 'POST',
        })
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
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
        const request = new Request('https://localhost/encrypted_resume', {
            method: 'POST',
            body: formdata,
        })
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
    })
})
