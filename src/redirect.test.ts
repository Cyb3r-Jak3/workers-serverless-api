import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'

describe('Redirect Endpoints', () => {
    it('List Redirects', async () => {
        const request = new Request('https://localhost/redirects')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
    })
    it('Get Redirected', async () => {
        const request = new Request('https://localhost/redirects/blog')
        const resp = await SELF.fetch(request, env)
        expect(resp.redirected).toEqual(true)
    })
    it('Missing redirect', async () => {
        const request = new Request('https://localhost/redirects/missing')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(404)
        expect(await resp.text()).toEqual(
            "You requested redirect 'missing' and it does not exist"
        )
    })
})
