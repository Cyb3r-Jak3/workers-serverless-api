import { HandleCachedResponse } from './utils'

const redirects: Redirect[] = [
    {
        path: '/github',
        redirect: 'www.github.com/Cyb3r-Jak3',
    },
    {
        path: '/gitlab',
        redirect: 'www.gitlab.com/Cyb3r-Jak3',
    },
    {
        path: '/docker',
        redirect: 'hub.docker.com/u/cyb3rjak3',
    },
    {
        path: '/twitter',
        redirect: 'twitter.com/Cyb3r_Jak3',
    },
    {
        path: '/html5action',
        redirect: 'github.com/Cyb3r-Jak3/html5validator-action',
    },
    {
        path: '/html5docker',
        redirect: 'github.com/Cyb3r-Jak3/html5validator-docker',
    },
    {
        path: '/blog',
        redirect: 'blog.cyberjake.xyz',
    },
    {
        path: '/home',
        redirect: 'cyberjake.xyz',
    },
    {
        path: '/cf',
        redirect: 'community.cloudflare.com/u/cyb3r-jak3/summary',
    },
]

const cache = caches.default
export const RedirectPath = '/redirects'

/**
 * Renders the redirect landing page
 * @param req Incoming Cloudflare request
 * @returns HTML page
 */
export async function RedirectLanding(req: Request): Promise<Response> {
    let response = await cache.match(req)
    if (response) {
        return HandleCachedResponse(response)
    }
    response = renderHtml(render_Page({ RedirectPath, redirects }))
    response.headers.set('Cache-Control', '3600')
    await cache.put(req, response.clone())
    return response
}

/**
 * Returns a user based on the path they gave
 * @param req Incoming Cloudflare request
 * @returns Redirect Response if redirect found or 404 error
 */
export async function Redirects(req: Request): Promise<Response> {
    let response = await cache.match(req)
    if (response) {
        return HandleCachedResponse(response)
    }
    const redirectSelection = new URL(req.url).pathname.replace(
        RedirectPath,
        ''
    )

    for (const redirect of redirects) {
        if (redirect.path == redirectSelection) {
            response = Response.redirect(`https://${redirect.redirect}`, 302)
            await cache.put(req, response.clone())
            return response
        }
    }
    if (!response) {
        return new Response(
            `You requested redirect: ${redirectSelection} and it does not exist`,
            { status: 404 }
        )
    }
    return response
}

export interface Redirect {
    path: string
    redirect: string
}

export const renderHtml = (page: () => string): Response =>
    new Response(page(), {
        headers: { 'Content-type': 'text/html; charset=UTF-8' },
    })

const render_Page =
    ({ redirects }: { RedirectPath: string; redirects: Redirect[] }) =>
    () =>
        `
<!doctype html>
<html>
  <head>
    <title>Redirects</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" integrity="sha512-wnea99uKIC3TJF7v4eKk4Y+lMz2Mklv18+r4na2Gn1abDRPPOeef95xTzdwGD9e6zXJBteMIhZ1+68QC5byJZw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
      .bg-gray-50 {
        background-color: #f9fafb;
        background-color: rgba(249,250,251,1);
      }
    </style>
  </head>
  <body>
    <ul class="flex items-center px-4 py-2">
      <div class="flex-1 flex items-center">
        <img class="w-16 h-16 mr-2" src="https://raw.githubusercontent.com/signalnerve/lilredirector/master/.github/logo.png" />
        <h1 class="text-2xl font-bold"> <a href="https://github.com/codewithkristian/lilredirector">Lil Redirector</a></h1>
      </div>
      <span><code>v1.0.1</code></span>
    </ul>

    <div class="py-6">
      <header class="mb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mt-2 md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
                Redirects (${redirects.length})
              </h2>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <section>
            ${
                redirects.length
                    ? `
            <table class="table-auto">
              <thead>
                <tr>
                  <th class="px-4 py-2">Path</th>
                  <th class="px-4 py-2">Redirect</th>
                </tr>
              </thead>
              <tbody>
                ${redirects
                    .filter((redirect: Redirect) => !!redirect.path)
                    .map(
                        (redirect: Redirect) => `
                  <tr>
                    <td class="border px-4 py-2"><a href="https://serverless.cyberjake.xyz/redirects${redirect.path}"> ${redirect.path} </a></td>
                    <td class="border px-4 py-2"><a href="https://${redirect.redirect}">${redirect.redirect}</a></td>
                  </tr>
                `
                    )
                    .join('\n')}
              </tbody>
            </table>
            `
                    : `<p>No redirects created yet!</p>`
            }
          </section>
        </div>
      </main>
    </div>
  </body>
</html>
`
