import {
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('Redirect Endpoints', () => {
    it('List Redirects', async () => {
        const resp = await SELF.fetch('https://localhost/redirects/')
        expect(resp.status).toBe(200)
        await resp.arrayBuffer(); // (drain)
    })
    it('Get Redirected', async () => {
        const resp = await SELF.fetch('https://localhost/redirects/home')
        expect(resp.redirected).toEqual(true)
        await resp.arrayBuffer(); // (drain)
    })
    it('Missing redirect', async () => {
        const resp = await SELF.fetch('https://localhost/redirects/missing')
        expect(resp.status).toBe(404)
        expect(await resp.text()).toEqual(
            "You requested redirect 'missing' and it does not exist"
        )
    })
})
