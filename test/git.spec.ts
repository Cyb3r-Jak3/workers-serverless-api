import {
    env,
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('Git Endpoints', () => {
    it('Git User', async () => {
        const resp = await SELF.fetch('https://localhost/git/user')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
        expect(await env.KV.get('GithubUserData')).toBeDefined()
    })
    it('Git Repos', async () => {
        const resp = await SELF.fetch('https://localhost/git/repos')
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
})
