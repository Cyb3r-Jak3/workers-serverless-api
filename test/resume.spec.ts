import {
    // env,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { exports } from "cloudflare:workers";

describe('Resume Endpoints', () => {
    it('GET Request', async () => {
        const resp = await exports.default.fetch('https://localhost/encrypted_resume')
        expect(resp.status).toBe(405)
    })
    it('Missing Resume', async () => {
        const request = new Request('https://localhost/encrypted_resume', {
            method: 'POST',
        })
        const resp = await exports.default.fetch(request)
        expect(resp.status).toBe(400)
    })

    it('Working Resume', async () => {
        const resume_resp = await fetch(
            'https://raw.githubusercontent.com/Cyb3r-Jak3/portfolio/main/static/files/connect%40cyberjake.xyz.asc'
        )
        if (resume_resp.status !== 200) {
            throw new Error(
                `Unable to get key. Got HTTP status ${resume_resp.status}`
            )
        }
        const resume: Blob = await resume_resp.blob()
        const formdata = new FormData()
        formdata.append('key', resume)
        const request = new Request('https://localhost/encrypted_resume', {
            method: 'POST',
            body: formdata,
        })
        const resp = await exports.default.fetch(request)
        expect(resp.status).toBe(200)
    })
})
