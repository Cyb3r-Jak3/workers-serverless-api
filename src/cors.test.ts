import {
    env,
    createExecutionContext,
    waitOnExecutionContext,
    SELF,
} from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import worker from '../src/index'
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

describe('CORS ', () => {
    it('Valid CORS', async () => {
        const request = new IncomingRequest(
            'https://localhost/cors?api_url=developers.cloudflare.com/schema&allowed_origin=http://localhost:8788'
        )
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);
        expect(resp.status).toBe(200)
    })

    it('No API URL', async () => {
        const request = new IncomingRequest(
            'https://localhost/cors?allowed_origin=http://localhost:8788'
        )
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);
        expect(resp.status).toBe(404)
    })

    it('Invalid Allowed Origin', async () => {
        const request = new IncomingRequest(
            'https://localhost/cors?api_url=developers.cloudflare.com/schema&allowed_origin=https://google.com'
        )
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);
        expect(resp.status).toBe(400)
    })

    it('Invalid Allowed URL', async () => {
        const request = new IncomingRequest(
            'https://localhost/cors?api_url=google.com&allowed_origin=https://google.com'
        )
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx);
        await waitOnExecutionContext(ctx);
        expect(resp.status).toBe(400)
    })
})
