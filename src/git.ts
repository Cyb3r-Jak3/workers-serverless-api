import { Octokit } from '@octokit/core'
import { JSONResponse } from './utils'
import { HandleCachedResponse } from './utils'
import { Context } from 'hono'

const octokit = new Octokit()
const GithubUsername = 'Cyb3r-Jak3'
const PublicEmail = 'git@cyberjake.xyz'
const cache = caches.default

export async function GithubRepos(c: Context): Promise<Response> {
    let resp = await cache.match(c.req)
    if (resp) {
        return HandleCachedResponse(resp)
    }
    if (!resp) {
        let data = await c.env.KV.get('GithubReposData', { type: 'json' })
        if (!data) {
            const repos = await octokit.request('GET /users/{username}/repos', {
                username: GithubUsername,
                sort: 'pushed',
            })
            data = repos.data
            await c.env.KV.put('GithubReposData', JSON.stringify(data), {
                expirationTtl: 3600,
            })
        }
        resp = JSONResponse(data, 200, [['Cache-Control', '3600']])
        await cache.put(c.req, resp.clone())
    }
    return resp
}

export async function GithubUser(c: Context): Promise<Response> {
    let resp = await cache.match(c.req)
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
        await c.env.KV.put('GithubUserData', JSON.stringify(data), {
            expirationTtl: 3600,
        })
    }
    resp = JSONResponse(data, 200, [['Cache-Control', '3600']])
    await cache.put(c.req, resp.clone())
    return resp
}
