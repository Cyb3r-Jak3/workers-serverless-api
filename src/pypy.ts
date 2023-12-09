import { Parser } from 'htmlparser2'
import {
    HandleCachedResponse,
    JSONAPIErrorResponse,
    JSONAPIResponse,
} from '@cyb3r-jak3/workers-common'
import { DefinedContext } from './types'

interface ChecksumPair {
    filename: string
    checksum: string
}

async function ParseChecksumsHTML(
    filename: string,
    checksum_mode: string
): Promise<ChecksumPair[]> {
    const checksum_html = await fetch('https://www.pypy.org/checksums.html', {
        headers: {
            'User-Agent': 'Cyb3rJak3 API',
        },
    })

    const checksum_pairs: ChecksumPair[] = []
    if (checksum_html.status !== 200) {
        console.error(
            `PyPy: Got ${checksum_html.status} when trying to parse pypy checksums`
        )
        return [
            { filename: 'error', checksum: "didn't get 200 response for pypy" },
        ]
    }

    const checksum_file_regex =
        /[A-Fa-f0-9]{64}\s\spypy\d.\d\d?-v\d.\d.\d{1,2}-.{7,20}/g
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
        return [{ filename: 'error', checksum: 'no checksums found' }]
    }

    for (const match_list of checksum_file_matches) {
        for (const match of match_list) {
            const split = match.split('  ', 2)
            if (checksum_mode === 'single' && split[1] === filename) {
                return [{ checksum: split[0], filename: split[1] }]
            }
            if (checksum_mode === 'bulk' && split[1].startsWith(filename)) {
                checksum_pairs.push({
                    filename: split[1],
                    checksum: split[0],
                })
            }
            if (checksum_mode === 'all') {
                checksum_pairs.push({
                    filename: split[1],
                    checksum: split[0],
                })
            }
        }
    }
    return checksum_pairs
}

const CacheToKV = async (KV: KVNamespace) => {
    const check_sums = await ParseChecksumsHTML('all', 'all')
    if (check_sums.length === 1 && check_sums[0].filename === 'error') {
        return
    }
    await KV.put('pypy_checksums_all', JSON.stringify(check_sums), {
        expirationTtl: 86400,
    })
}

export async function PyPyChecksumsEndpoint(
    c: DefinedContext
): Promise<Response> {
    const cache = caches.default
    let response = await cache.match(c.req.raw)
    if (response) {
        return HandleCachedResponse(response)
    }

    const { filename } = c.req.param()
    if (!filename) {
        return JSONAPIErrorResponse('filename is required', 400)
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

    let checksum_response: ChecksumPair[] = []

    if (kvKey) {
        const data = await c.env.KV.get(kvKey, { type: 'json' })
        if (data) {
            console.log(`PyPy: Got KV hit: ${kvKey}`)
            response = JSONAPIResponse(data, {
                extra_headers: { 'Cache-control': 'public; max-age=604800' },
            })
            c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()))
            return response
        }
    }

    const cached_data: ChecksumPair[] | null = await c.env.KV.get(
        'pypy_checksums_all',
        { type: 'json' }
    )

    if (cached_data) {
        for (const pair of cached_data) {
            if (checksum_mode === 'single' && pair.filename === filename) {
                checksum_response = [pair]
                break
            }
            if (
                checksum_mode === 'bulk' &&
                pair.filename.startsWith(filename)
            ) {
                checksum_response.push(pair)
            }
        }
    } else {
        checksum_response = await ParseChecksumsHTML(filename, checksum_mode)
        c.executionCtx.waitUntil(CacheToKV(c.env.KV))
        if (
            checksum_response.length === 1 &&
            checksum_response[0].filename === 'error'
        ) {
            return JSONAPIResponse(checksum_response)
        }
    }

    if (kvKey && checksum_response.length !== 0) {
        c.executionCtx.waitUntil(
            c.env.KV.put(kvKey, JSON.stringify(checksum_response))
        )
    }

    response = JSONAPIResponse(checksum_response, {
        extra_headers: { 'cache-control': 'public; max-age=86400' },
    })

    if (checksum_response.length !== 0) {
        c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()))
    }

    return response
}
