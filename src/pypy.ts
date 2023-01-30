import { Parser } from 'htmlparser2'
import {
    HandleCachedResponse,
    JSONErrorResponse,
    JSONResponse,
} from '@cyb3r-jak3/workers-common'
import type { Context } from 'hono'

interface ChecksumPair {
    filename: string
    checksum: string
}

export async function PyPyChecksumsEndpoint(c: Context): Promise<Response> {
    const cache = caches.default
    let response = await cache.match(c.req)
    if (response) {
        return HandleCachedResponse(response)
    }
    const { filename } = c.req.param()
    if (!filename) {
        return c.notFound()
    }

    let checksum_mode: 'single' | 'bulk' | 'all'
    if (filename === 'all') {
        checksum_mode = 'all'
    } else if (filename.endsWith('.zip') || filename.endsWith('.bz2')) {
        checksum_mode = 'single'
    } else {
        checksum_mode = 'bulk'
    }

    let kvKey: string

    switch (checksum_mode) {
        case 'all':
            kvKey = 'pypy_checksums_all'
            break

        case 'bulk':
            kvKey = `pypy_checksums_bulk_${filename}`
            break

        default:
            kvKey = ''
            break
    }

    if (kvKey) {
        const data = await c.env.KV.get(kvKey, { type: 'json' })
        if (data) {
            console.log(`Got KV hit: ${kvKey}`)
            response = JSONResponse(data, {
                extra_headers: { 'Cache-control': 'public; max-age=604800' },
            })
            c.executionCtx.waitUntil(cache.put(c.req, response.clone()))
            return response
        }
    }

    const checksum_html = await fetch('https://www.pypy.org/checksums.html', {
        headers: {
            'User-Agent': 'Cyb3rJak3 API',
        },
    })
    if (checksum_html.status !== 200) {
        return JSONErrorResponse(
            `wanted 200 response for pypy and got ${checksum_html.status}`
        )
    }

    const checksum_file_regex =
        /[A-Fa-f0-9]{64}\s\spypy\d.\d-v\d.\d.\d{1,2}-.{7,20}/g
    const checksum_file_matches: RegExpMatchArray[] = []
    const parser = new Parser({
        ontext(text) {
            if (text.indexOf(filename)) {
                checksum_file_matches.push(
                    ...[...text.matchAll(checksum_file_regex)]
                )
            }
        },
    })
    parser.write(await checksum_html.text())
    parser.end()

    if (checksum_file_matches.length === 0) {
        return c.notFound()
    }

    const checksum_response: ChecksumPair[] = []
    for (const match_list of checksum_file_matches) {
        for (const match of match_list) {
            const split = match.split('  ', 2)
            if (checksum_mode === 'single' && split[1] === filename) {
                response = JSONResponse(
                    { checksum: split[0], filename: split[1] },
                    {
                        extra_headers: {
                            'Cache-control': 'public; max-age=604800',
                        },
                    }
                )
                c.executionCtx.waitUntil(cache.put(c.req, response.clone()))
                return response
            }
            if (checksum_mode === 'bulk' && split[1].startsWith(filename)) {
                checksum_response.push({
                    filename: split[1],
                    checksum: split[0],
                })
            }
            if (checksum_mode === 'all') {
                checksum_response.push({
                    filename: split[1],
                    checksum: split[0],
                })
            }
        }
    }

    if (kvKey) {
        c.executionCtx.waitUntil(
            c.env.KV.put(kvKey, JSON.stringify(checksum_response))
        )
    }

    response = JSONResponse(checksum_response, {
        extra_headers: { 'Cache-control': 'public; max-age=604800' },
    })
    c.executionCtx.waitUntil(cache.put(c.req, response.clone()))
    return response
}
