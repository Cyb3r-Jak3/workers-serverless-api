import { JSONResponse, JSONErrorResponse } from '../src/utils'
import makeServiceWorkerEnv from 'service-worker-mock'

declare var global: any

describe('JSONResponse', () => {
    beforeEach(() => {
        Object.assign(global, makeServiceWorkerEnv())
        jest.resetModules()
    })

    test('200 response', async () => {
        const result = JSONResponse({ Hello: 'World' })
        expect(result.status).toEqual(200)
        expect(result.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
    test('500 response', async () => {
        const result = JSONErrorResponse('I should fail')
        expect(result.status).toEqual(500)
        expect(result.headers.get('content-type')).toEqual(
            'application/json; charset=UTF-8'
        )
    })
})
