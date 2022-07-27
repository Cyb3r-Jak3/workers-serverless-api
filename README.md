# Serverless API

This is a rewrite of my [go api](https://github.com/Cyb3r-Jak3/go-api). Written in typescript and written to run on [Cloudflare's Workers](https://developers.cloudflare.com/workers/)

## Endpoints

The following endpoints are available

#### [`/git/repos`]((https://serverless.cyberjake.xyz/git/repos)

Returns a JSON response of my Github Repos

#### [`/git/user`](https://serverless.cyberjake.xyz/git/user)

Returns a JSON response of my Github Profile

#### [`/misc/gravatar`](https://serverless.cyberjake.xyz/misc/gravatar)

You can either do a GET request to `/misc/gravatar/<email here>` and get a text response or POST request to `/misc/gravatar` with a JSON body field of `email`

#### [`/redirects/`](https://serverless.cyberjake.xyz/redirects)

A list of redirects to my stuff. Based off of [lilredirector](https://github.com/codewithkristian/lilredirector)
