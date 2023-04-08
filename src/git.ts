import { Octokit } from '@octokit/core'
import {
    JSONAPIResponse,
    HandleCachedResponse,
} from '@cyb3r-jak3/workers-common'
import { Context } from 'hono'

const GithubUsername = 'Cyb3r-Jak3'
const PublicEmail = 'connect@cyberjake.xyz'

export async function GithubRepos(c: Context): Promise<Response> {
    const cache = caches.default
    const octokit = new Octokit()

    let resp = await cache.match(c.req.raw)
    if (resp) {
        return HandleCachedResponse(resp)
    }
    let data = await c.env.KV.get('GithubReposData', { type: 'json' })
    if (!data) {
        const repos = await octokit.request('GET /users/{username}/repos', {
            username: GithubUsername,
            sort: 'pushed',
            per_page: 100,
        })
        data = repos.data
        c.executionCtx.waitUntil(
            await c.env.KV.put('GithubReposData', JSON.stringify(data), {
                expirationTtl: 3600,
            })
        )
    }
    resp = JSONAPIResponse(data, {
        extra_headers: { 'Cache-Control': 'public, max-age=3600' },
    })
    c.executionCtx.waitUntil(cache.put(c.req.raw, resp.clone()))
    return resp
}

export async function GithubUser(c: Context): Promise<Response> {
    const cache = caches.default
    const octokit = new Octokit()
    let resp = await cache.match(c.req.raw)
    if (resp) {
        return HandleCachedResponse(resp)
    }
    let data = await c.env.KV.get('GithubUserData', { type: 'json' })
    if (!data) {
        const user = await octokit.request('GET /users/{username}', {
            username: GithubUsername,
        })
        user.data.email = PublicEmail
        user.data.url = user.data.html_url
        data = user.data
        c.executionCtx.waitUntil(
            c.env.KV.put('GithubUserData', JSON.stringify(data), {
                expirationTtl: 3600,
            })
        )
    }
    resp = JSONAPIResponse(data, {
        extra_headers: { 'Cache-Control': 'public, max-age=3600' },
    })
    c.executionCtx.waitUntil(cache.put(c.req.raw, resp.clone()))
    return resp
}
