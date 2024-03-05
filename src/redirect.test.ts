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
        const resp = await SELF.fetch('https://localhost/redirects/')
        expect(resp.status).toBe(200)
    })
    it('Get Redirected', async () => {
        const resp = await SELF.fetch('https://localhost/redirects/redirected')
        expect(resp.redirected).toEqual(true)
    })
    it('Missing redirect', async () => {
        const resp = await SELF.fetch('https://localhost/redirects/missing')
        expect(resp.status).toBe(404)
        expect(await resp.text()).toEqual(
            "You requested redirect 'missing' and it does not exist"
        )
    })
})
