import { Octokit } from '@octokit/core'
import { JSONResponse } from './utils'
const octokit = new Octokit()
const GithubUsername = 'Cyb3r-Jak3'
const PublicEmail = 'git@cyberjake.xyz'
const cache = caches.default

export async function GithubRepos(req: Request): Promise<Response> {
    let resp = await cache.match(req)
    if (!resp) {
        let data = await KV.get('GithubReposData', { type: 'json' })
        if (!data) {
            const repos = await octokit.request('GET /users/{username}/repos', {
                username: GithubUsername,
                sort: 'pushed',
            })
            data = repos.data
            await KV.put('GithubReposData', JSON.stringify(data), {
                expirationTtl: 3600,
            })
        }
        resp = JSONResponse(data, 200, [['Cache-Control', '3600']])
        await cache.put(req, resp.clone())
    }
    return resp
}

export async function GithubUser(req: Request): Promise<Response> {
    let resp = await cache.match(req)
    if (!resp) {
        let data = await KV.get('GithubUserData', { type: 'json' })
        if (!data) {
            const user = await octokit.request('GET /users/{username}', {
                username: GithubUsername,
            })
            // const user = await octokit.users.getByUsername({
            //     username: GithubUsername,
            // })
            user.data.email = PublicEmail
            user.data.url = user.data.html_url
            data = user.data
            await KV.put('GithubUserData', JSON.stringify(data), {
                expirationTtl: 3600,
            })
        }
        resp = JSONResponse(data, 200, [['Cache-Control', '3600']])
        await cache.put(req, resp.clone())
    }
    return resp
}

// export async function GithubRepoList(): Promise<Response> {
//     const data = await KV.get('GithubRepoList', { type: 'json' })
//     if (!data) {
//         const repos = await KV.get('GithubReposData', { type: 'json' })
//         if (!repos) {
//             const repos = await octokit.request("GET /users/{username}/repos",  {username: GithubUsername, sort: 'pushed'})
//             await KV.put('GithubReposData', JSON.stringify(repos.data), {
//                 expirationTtl: 3600,
//             })
//         }
//         // for (let repo of fullRepos)
//         // let screened: [] = []
//         // repos.forEach((repo) => {
//         //     screened.push(repo)
//         // })
//         // await KV.put("GithubRepoList", JSON.stringify(screened), {expirationTtl: 3600})
//     }
//     return JSONResponse(data)
// }
