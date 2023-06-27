import type { Context } from 'hono'
import { HandleCachedResponse } from '@cyb3r-jak3/workers-common'

const supported_programs = ['maven']

export async function MavenDownloadEndpoint(c: Context): Promise<Response> {
    const cache = caches.default
    let response = await cache.match(c.req.raw)
    if (response) {
        return HandleCachedResponse(response)
    }
    const program = c.req.param('program')
    const version = c.req.query('version')
    if (!program) {
        return new Response('program is required', { status: 400 })
    }
    if (!supported_programs.includes(program)) {
        return new Response(`program '${program}; is not supported`, {
            status: 400,
        })
    }
    if (!version) {
        return new Response('version is required', { status: 400 })
    }
    const programPath = `${program}/${version}`
    const bucket_file: R2ObjectBody | null = await c.env.PUBLIC_FILES.get(
        programPath
    )
    if (!bucket_file) {
        const downloadUrl = `https://dlcdn.apache.org/maven/maven-${version[0]}/${version}/binaries/apache-maven-${version}-bin.tar.gz`
        const downloadResponse = await fetch(downloadUrl, {
            cf: { cacheTtl: 86400 },
            headers: {
                'User-Agent': 'Cyb3r-Jak3/Serverless-API',
            },
        })
        if (!downloadResponse.ok) {
            return new Response(downloadResponse.statusText, {
                status: downloadResponse.status,
            })
        }
        c.executionCtx.waitUntil(
            c.env.PUBLIC_FILES.put(
                `${program}/${version}`,
                downloadResponse.clone().body,
                {
                    httpMetadata: {
                        contentType: 'application/gzip',
                        cacheControl: 'public, max-age=2628003',
                        contentDisposition: `attachment; filename="apache-maven-${version}-bin.tar.gz"`,
                    },
                }
            )
        )
        response = new Response(downloadResponse.body, {
            headers: {
                'Content-Type': 'application/gzip',
                'Content-Disposition': `attachment; filename="apache-maven-${version}-bin.tar.gz"`,
                'Cache-Control': 'public, max-age=2628003',
            },
            status: downloadResponse.status,
        })
    } else {
        response = new Response(bucket_file.body, {
            headers: {
                'Content-Type':
                    bucket_file.httpMetadata?.contentType ?? 'application/gzip',
                'Content-Disposition':
                    bucket_file.httpMetadata?.contentDisposition ??
                    `attachment; filename="apache-maven-${version}-bin.tar.gz"`,
                'Cache-Control':
                    bucket_file.httpMetadata?.cacheControl ??
                    'public, max-age=2628003',
                'X-Served-From': 'R2',
            },
            status: 200,
        })
    }
    c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()))
    return response
}
