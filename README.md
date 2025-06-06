# Serverless API

[![Deploy](https://github.com/Cyb3r-Jak3/workers-serverless-api/actions/workflows/main.yml/badge.svg)](https://github.com/Cyb3r-Jak3/workers-serverless-api/actions/workflows/main.yml)

This is a rewrite of my [go api](https://github.com/Cyb3r-Jak3/go-api). Written in typescript and written to run on [Cloudflare's Workers](https://developers.cloudflare.com/workers/)

## Endpoints

The following endpoints are available

#### [`/git/repos`](https://api.cyberjake.xyz/git/repos)

Returns a JSON response of my Github Repos

#### [`/git/user`](https://api.cyberjake.xyz/git/user)

Returns a JSON response of my Github Profile

#### [`/misc/gravatar`](https://api.cyberjake.xyz/misc/gravatar)

You can either do a GET request to `/misc/gravatar/<email here>` and get a text response or POST request to `/misc/gravatar` with a JSON body field of `email`

#### [`/redirects/`](https://api.cyberjake.xyz/redirects/)

A list of redirects to my stuff. Based off of [lilredirector](https://github.com/codewithkristian/lilredirector)

#### [`/cf`](https://api.cyberjake.xyz/cf)

Returns Cloudflare headers

#### [`/version`](https://api.cyberjake.xyz/version)

Return version info

#### [`/encrypted_resume`](https://api.cyberjake.xyz/encrypted_resume)

Returns an encrypted version of my resume. Requires a POST formdata request with your public key as a file called `key`

#### [`/pypy/checksums/:filename`](https://api.cyberjake.xyz/pypy/checksums/all)

Get a JSON array of [PyPy Checksums](https://www.pypy.org/checksums.html).

For `filename` you can use `all` to get all checksums or you can filter down to version (`pypy3.9-v7.3.11`) or single file (`pypy3.9-v7.3.11-src.tar.bz2`).

#### [`/cloudflare_api/alert_types`](https://api.cyberjake.xyz/cloudflare_api/alert_types)

Get all of the alert types that Cloudflare has.

#### [`/cloudflare_api/token_permissions`](https://api.cyberjake.xyz/cloudflare_api/token_permissions)

Get all of the possible permissions for a Cloudflare API Token.

## Development

Create an API Token using this [token shortcut](https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%2C%7B%22key%22%3A%22api_tokens%22%2C%22type%22%3A%22read%22%7D%5D&name=Serverless+API+Reader) then add it and the account id to your `.dev.vars` file for local development.
