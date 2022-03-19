import { Router } from 'itty-router'
import { GithubRepos, GithubUser } from './git'
import { GravatarHash } from './misc'
import { RedirectLanding, RedirectPath, Redirects } from './redirect'

const router = Router()

if (PRODUCTION === 'true') {
    router.get('/', () =>
        Response.redirect(
            'https://github.com/Cyb3r-Jak3/workers-serverless-api',
            302
        )
    )
}

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
