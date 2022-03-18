import { Router } from 'itty-router'
import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './misc'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'
import { JSONResponse } from './utils'

const router = Router()

router.get('/', () => {
    return JSONResponse(router.routes)
})

router.get('/git/repos', GithubRepos)
// router.get('/git/repos/list', GithubRepos)
router.get('/git/user', GithubUser)
router.post('/misc/gravatar', GravatarHash)
router.get('/misc/gravatar/:email', GravatarHash)
router.get(`${RedirectPath}/`, RedirectLanding)
router.get(`${RedirectPath}/:short_link`, Redirects)
router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (e) => {
    e.respondWith(router.handle(e.request))
})
