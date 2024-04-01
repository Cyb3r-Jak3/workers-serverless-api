import {
    SELF,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('CORS ', () => {
    it('Valid CORS', async () => {
        const resp = await SELF.fetch(
            'https://localhost/cors?api_url=developers.cloudflare.com/schema&allowed_origin=http://localhost:8788'
        )
        expect(resp.status).toBe(200)
    })

    it('No API URL', async () => {
        const resp = await SELF.fetch('https://localhost/cors?allowed_origin=http://localhost:8788')
        expect(resp.status).toBe(404)
    })

    it('Invalid Allowed Origin', async () => {
        const resp = await SELF.fetch('https://localhost/cors?api_url=developers.cloudflare.com/schema&allowed_origin=https://google.com')
        expect(resp.status).toBe(400)
    })

    it('Invalid Allowed URL', async () => {
        const resp = await SELF.fetch('https://localhost/cors?api_url=google.com&allowed_origin=https://google.com')
        expect(resp.status).toBe(400)
    })
})
