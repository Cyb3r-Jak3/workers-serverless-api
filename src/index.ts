import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './gravatar'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'
import { CORSHandle, CORS_ENDPOINT } from './cors'
import { Hono } from 'hono'
import { EncryptResumeEndpoint } from './resume'
import { VersionEndpoint, CFEndpoint } from './misc'
import { LogToAE } from './utils'
import { PyPyChecksumsEndpoint } from './pypy'

interface ENV {
    KV: KVNamespace
    PRODUCTION: 'false' | 'true'
    AE: AnalyticsEngineDataset
    GitHash: string
    BuildTime: string
}

const app = new Hono<{ Bindings: ENV }>()

app.use('*', LogToAE)
app.get('/git/repos', GithubRepos)
app.get('/git/user', GithubUser)
app.post('/misc/gravatar', GravatarHash)
app.get('/misc/gravatar/:email', GravatarHash)
app.all('/encrypted_resume', EncryptResumeEndpoint)
app.get(`${RedirectPath}`, RedirectLanding)
app.get(`${RedirectPath}/`, RedirectLanding)
app.get(`${RedirectPath}/:short_link`, Redirects)
app.get('/cf', CFEndpoint)
app.get('/version', VersionEndpoint)
app.get('/pypy/checksums/:filename', PyPyChecksumsEndpoint)
app.all(`${CORS_ENDPOINT}`, CORSHandle)

app.all('/', async (c) => {
    if (c.env.PRODUCTION === 'true') {
        return c.redirect('https://cyberjake.xyz/', 301)
    } else return await c.notFound()
})
app.all('*', (c) => c.notFound())

export default app
