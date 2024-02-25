import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
    SELF
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'

describe('Git Endpoints', () => {
    it('Git User', async () => {
        const request = new Request('https://localhost/git/user')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
    it('Git Repos', async () => {
        const request = new Request('https://localhost/git/repos')
        const resp = await SELF.fetch(request, env)
        expect(resp.status).toBe(200)
        expect(resp.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
})
