import {
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('Gravatar Endpoints', () => {
    it('Missing GET Gravatar', async () => {
        const resp = await SELF.fetch('http://localhost/misc/gravatar/')
        expect(resp.status).toBe(404)
    })
    it('GET Gravatar', async () => {
        const resp = await SELF.fetch('http://localhost/misc/gravatar/git@cyberjake.xyz')
        expect(resp.status).toBe(200)
        expect(await resp.text()).toBe('defe57d080afd413dd389cab9556355c')
    })
    it('Missing POST Gravatar', async () => {
        const request = new Request('http://localhost/misc/gravatar/', {
            method: 'POST',
        })
        const resp = await SELF.fetch(request)
        expect(resp.status).toBe(404)
    })
    it('POST Gravatar', async () => {
        const request = new Request('http://localhost/misc/gravatar', {
            method: 'POST',
            body: JSON.stringify({ email: 'git@cyberjake.xyz' }),
        })
        const resp = await SELF.fetch(request)
        expect(resp.status).toBe(200)
        expect(await resp.json()).toMatchObject({
            results: { hash: 'defe57d080afd413dd389cab9556355c' }
        })
    })
})
