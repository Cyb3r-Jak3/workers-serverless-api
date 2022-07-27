import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './gravatar'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'
import { CORSHandle, CORS_ENDPOINT } from './cors'
import { Hono } from 'hono'
import { PingEndpoint } from './ping'

interface ENV {
    KV: KVNamespace
    PRODUCTION: 'false' | 'true'
    GitHash: string
}

const app = new Hono<ENV>()

app.get('/git/repos', GithubRepos)
app.get('/git/user', GithubUser)
app.post('/misc/gravatar', GravatarHash)
app.get('/misc/gravatar/:email', GravatarHash)
app.get(`${RedirectPath}/`, RedirectLanding)
app.get(`${RedirectPath}/:short_link`, Redirects)
app.get("/ping", PingEndpoint)
app.all(`${CORS_ENDPOINT}/`, CORSHandle)

app.all('/', async (c) => {
    if (c.env.PRODUCTION === 'true') {
        return c.redirect(
            'https://github.com/Cyb3r-Jak3/workers-serverless-api',
            301
        )
    } else return await c.notFound()
})
app.all('*', (c) => c.notFound())

export default app
