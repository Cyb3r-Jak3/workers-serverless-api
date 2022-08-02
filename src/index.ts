import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './gravatar'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'
import { CORSHandle, CORS_ENDPOINT } from './cors'
import { Hono } from 'hono'
import { EncryptResumeEndpoint } from './resume'
import { VersionEndpoint, CFEndpoint } from './misc'

interface ENV {
    KV: KVNamespace
    PRODUCTION: 'false' | 'true'
    GitHash: string
    BuildTime: string
}

const app = new Hono<ENV>()

app.get('/git/repos', GithubRepos)
app.get('/git/user', GithubUser)
app.post('/misc/gravatar', GravatarHash)
app.post('/encrypted_resume', EncryptResumeEndpoint)
app.get('/misc/gravatar/:email', GravatarHash)
app.get(`${RedirectPath}`, RedirectLanding)
app.get(`${RedirectPath}/`, RedirectLanding)
app.get(`${RedirectPath}/:short_link`, Redirects)
app.get('/cf', CFEndpoint)
app.get('/version', VersionEndpoint)
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
