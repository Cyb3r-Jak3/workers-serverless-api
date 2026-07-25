import { describe, expect, it } from 'vitest'
import { exports } from "cloudflare:workers";

describe('Worker Prod', () => {
    it('Index Redirect', async () => {
        const resp = await exports.default.fetch('http://localhost/', {redirect: 'manual'})
        expect(resp.redirected).toEqual(false)
    })
})
