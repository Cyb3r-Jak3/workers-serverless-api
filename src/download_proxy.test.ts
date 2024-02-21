// import { unstable_dev } from 'wrangler'
// import type { UnstableDevWorker } from 'wrangler'
import { env, SELF, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it} from 'vitest'
import worker from '../src/index'

describe('Download proxy ', () => {

    it('Missing program', async () => {
        const request = new Request('https://localhost/download_proxy/')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(await resp.json()).toEqual([
            'maven',
            'node',
            'python',
            'pypy',
            'node_exporter',
        ])
    })

    it('Missing version', async () => {
        const request = new Request('https://localhost/download_proxy/not_a_program')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe('version is required')
    })

    it('Invalid program', async () => {
        const request = new Request('https://localhost/download_proxy/not_a_program?version=1.0.0')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe("program 'not_a_program; is not supported")
    })

    it('List supported versions', async () => {
        const request = new Request('https://localhost/download_proxy/supported')
        const ctx = createExecutionContext();
        const resp = await worker.fetch(request, env, ctx)
        await waitOnExecutionContext(ctx)
        expect(resp.status).toBe(200)
        expect(await resp.json()).toEqual([
            'maven',
            'node',
            'python',
            'pypy',
            'node_exporter',
        ])
    })

    describe('maven', () => {
        it('Valid maven version', async () => {
            const request = new Request('https://localhost/download_proxy/maven?version=3.9.3')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })
        it('Missing maven version', async () => {
            const request = new Request('https://localhost/download_proxy/maven?version=1.0.0')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(404)
        })
    })

    describe('python', () => {
        it('Valid Python version', async () => {
            const request = new Request('https://localhost/download_proxy/python?version=3.11.4')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })
        it('Missing Python version', async () => {
            const request = new Request('https://localhost/download_proxy/python?version=1.0.0')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(404)
        })
    })

    describe('nodejs', () => {
        it('Valid NodeJS version', async () => {
            const request = new Request('https://localhost/download_proxy/node?version=16.10.0')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })

        it('Valid NodeJS version with arch', async () => {
            const request = new Request('https://localhost/download_proxy/node?version=16.10.0&arch=linux-x64')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })

        it('Valid NodeJS version with invalid arch', async () => {
            const request = new Request('https://localhost/download_proxy/node?version=16.10.0&arch=nope')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(404)
        })

        it('Missing NodeJS version', async () => {
            const request = new Request('https://localhost/download_proxy/node?version=1.0.0')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(404)
        })

    })

    describe('pypy', () => {
        it('Valid PyPy version', async () => {
            const request = new Request('https://localhost/download_proxy/pypy?version=3.10-v7.3.12')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })
        it('Valid PyPy version with arch', async () => {
            const request = new Request('https://localhost/download_proxy/pypy?version=3.10-v7.3.12&arch=linux64')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })
        it('Missing PyPy version', async () => {
            const request = new Request('https://localhost/download_proxy/pypy?version=1.0.0')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(404)
        })
    })
    describe('node_exporter', () => {
        it('Valid Node Exporter version', async () => {
            const request = new Request('https://localhost/download_proxy/node_exporter?version=1.7.0')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })
        it('Valid Node Exporter version with arch', async () => {
            const request = new Request('https://localhost/download_proxy/node_exporter?version=1.7.0&arch=arm64')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(200)
        })
        it('Missing Node Exporter version', async () => {
            const request = new Request('https://localhost/download_proxy/node_exporter?version=1.6.2')
            const ctx = createExecutionContext();
            const resp = await worker.fetch(request, env, ctx)
            await waitOnExecutionContext(ctx)
            expect(resp.status).toBe(404)
        })
    })
})
