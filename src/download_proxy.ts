import { HandleCachedResponse } from '@cyb3r-jak3/workers-common'
import { DefinedContext } from './types'

interface supported_program {
    [key: string]: {
        url(version: string, arch?: string, os?: string): string
        filename(version: string, arch?: string, os?: string): string
    }
}

const supported_programs: supported_program = {
    maven: {
        url: (version: string) =>
            `https://archive.apache.org/dist/maven/maven-${version[0]}/${version}/binaries/apache-maven-${version}-bin.tar.gz`,
        filename: (version: string) => `apache-maven-${version}-bin.tar.gz`,
    },
    node: {
        url: (version: string, arch: string) =>
            `https://nodejs.org/dist/v${version}/node-v${version}-${
                arch ?? 'linux-x64'
            }.tar.xz`,
        filename: (version: string, arch: string) =>
            `node-v${version}-${arch ?? 'linux-x64'}.tar.xz`,
    },
    python: {
        url: (version: string) =>
            `https://www.python.org/ftp/python/${version}/Python-${version}.tgz`,
        filename: (version: string) => `Python-${version}.tgz`,
    },
    pypy: {
        url: (version: string, arch: string) =>
            `https://downloads.python.org/pypy/pypy${version}-${
                arch ?? 'linux64'
            }.tar.bz2`,
        filename: (version: string, arch: string) =>
            `pypy${version}-${arch ?? 'linux64'}.tar.bz2`,
    },
    node_exporter: {
        url: (version: string, arch: string, os: string) =>
            `https://github.com/prometheus/node_exporter/releases/download/v${version}/node_exporter-${version}.${os}-${arch ?? 'amd64'}.tar.gz`,
        filename: (version: string, arch: string, os: string) =>
            `node_exporter-${version}.${os}-${arch ?? 'amd64'}.tar.gz`,
    },
}

export async function DownloadProxyEndpoint(
    c: DefinedContext
): Promise<Response> {
    const cache = caches.default
    let response = await cache.match(c.req.raw)
    if (response) {
        return HandleCachedResponse(response)
    }
    const program = c.req.param('program')
    if (program === 'supported' || !program) {
        return new Response(JSON.stringify(Object.keys(supported_programs)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    const version = c.req.query('version')
    const arch = c.req.query('arch')
    let os = c.req.query('os')

    if (!program) {
        return new Response('`program` parameter is required', { status: 400 })
    }
    if (!version) {
        return new Response('`version`url query parameter is required', {
            status: 400,
        })
    }
    if (!os) {
        os = 'linux'
    }

    if (!Object.prototype.hasOwnProperty.call(supported_programs, program)) {
        return new Response(`program '${program}; is not supported`, {
            status: 400,
        })
    }
    const filename = supported_programs[program].filename(version, arch, os)

    const programPath = `${program}/${filename}`
    const bucket_file: R2ObjectBody | null =
        await c.env.PUBLIC_FILES.get(programPath)
    const downloadUrl = supported_programs[program].url(version, arch, os)

    if (!bucket_file) {
        const downloadResponse = await fetch(downloadUrl, {
            cf: { cacheTtl: 86400 },
            headers: {
                'User-Agent': 'Cyb3r-Jak3/Serverless-API-Download-Proxy',
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
                        contentDisposition: `attachment; filename="${filename}"`,
                    },
                }
            )
        )
        response = new Response(downloadResponse.body, {
            headers: {
                'Content-Type': 'application/gzip',
                'Content-Disposition': `attachment; filename="${filename}"`,
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
                    `attachment; filename="${filename}"`,
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
