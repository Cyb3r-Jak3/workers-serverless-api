import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'

describe('Gravatar Endpoints', () => {
    it('Missing GET Gravatar', async () => {
        const request = new Request('https://localhost/misc/gravatar/')
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(404)
    })
    it('GET Gravatar', async () => {
        const request = new Request('/misc/gravatar/git@cyberjake.xyz')
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(await resp.text()).toBe('defe57d080afd413dd389cab9556355c')
    })
    it('Missing POST Gravatar', async () => {
        const request = new Request('/misc/gravatar/', {
            method: 'POST',
        })
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(404)
    })
    it('POST Gravatar', async () => {
        const request = new Request('/misc/gravatar/', {
            method: 'POST',
            body: JSON.stringify({ email: 'git@cyberjake.xyz' }),
        })
        const ctx = createExecutionContext()
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(await resp.text()).toBe('defe57d080afd413dd389cab9556355c')
    })
})
