import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

describe('Download proxy ', () => {
    let worker: UnstableDevWorker

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: { disableExperimentalWarning: true },
            local: true,
        })
    })

    afterAll(async () => {
        await worker.stop()
    })

    it('Missing program', async () => {
        const resp = await worker.fetch('/download_proxy/')
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe('program is required')
    })

    it('Missing version', async () => {
        const resp = await worker.fetch('/download_proxy/not_a_program')
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe('version is required')
    })

    it('Invalid program', async () => {
        const resp = await worker.fetch(
            '/download_proxy/not_a_program?version=1.0.0'
        )
        expect(resp.status).toBe(400)
        expect(await resp.text()).toBe(
            "program 'not_a_program; is not supported"
        )
    })

    it('List supported versions', async () => {
        const resp = await worker.fetch('/download_proxy/supported')
        expect(resp.status).toBe(200)
        expect(await resp.json()).toEqual(['maven', 'node', 'python', 'pypy'])
    })

    describe('maven', () => {
        it('Valid maven version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/maven?version=3.9.3'
            )
            expect(resp.status).toBe(200)
        })

        it('Missing maven version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/maven?version=1.0.0'
            )
            expect(resp.status).toBe(404)
        })
    })

    describe('python', () => {
        it('Valid Python version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/python?version=3.11.4'
            )
            expect(resp.status).toBe(200)
        })
        it('Missing Python version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/python?version=1.0.0'
            )
            expect(resp.status).toBe(404)
        })
    })

    describe('nodejs', () => {
        it('Valid NodeJS version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/node?version=16.10.0'
            )
            expect(resp.status).toBe(200)
        })
        it('Valid NodeJS version with arch', async () => {
            const resp = await worker.fetch(
                '/download_proxy/node?version=16.10.0&arch=linux-x64'
            )
            expect(resp.status).toBe(200)
        })
        it('Valid NodeJS version with invalid arch', async () => {
            const resp = await worker.fetch(
                '/download_proxy/node?version=16.10.0&arch=nope'
            )
            expect(resp.status).toBe(404)
        })
        it('Missing NodeJS version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/node?version=1.0.0'
            )
            expect(resp.status).toBe(404)
        })
    })

    describe('pypy', () => {
        it('Valid PyPy version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/pypy?version=3.10-v7.3.12'
            )
            expect(resp.status).toBe(200)
        })
        it('Valid PyPy version with arch', async () => {
            const resp = await worker.fetch(
                '/download_proxy/pypy?version=3.10-v7.3.12&arch=linux64'
            )
            expect(resp.status).toBe(200)
        })
        it('Missing PyPy version', async () => {
            const resp = await worker.fetch(
                '/download_proxy/pypy?version=1.0.0'
            )
            expect(resp.status).toBe(404)
        })
    })
})
