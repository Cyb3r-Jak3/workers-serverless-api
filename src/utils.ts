const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
}
/**
 * Creates a JSON response
 * @param ResponseData Object to turn into JSON data
 * @param status HTTP status code
 * @param extra_headers Any extra headers to add
 * @returns JSON Response
 */
export function JSONResponse(
    ResponseData: string | unknown,
    status?: number,
    extra_headers?: string[][]
): Response {
    if (!status) {
        status = 200
    }
    const send_headers = new Headers({
        'content-type': 'application/json; charset=UTF-8',
    })
    if (extra_headers) {
        extra_headers.forEach((element) => {
            send_headers.append(element[0], element[1])
        })
    }
    return new Response(JSON.stringify(ResponseData), {
        status: status,
        headers: send_headers,
    })
}

/**
 * Simple wrapper for making JSON responses with error status codes
 * @param errMessage String or object to turn into JSON
 * @param status HTTP status code to return. Defaults to 500
 * @returns
 */
export function JSONErrorResponse(errMessage: string, status = 500): Response {
    return JSONResponse({ Error: errMessage }, status)
}

/**
 * Handles any CORs requests
 * @param request Incoming request to handle CORs for
 * @returns CORs response
 */
export function HandleOptions(request: Request): Response {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers
    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        // If you want to check or reject the requested method + headers
        // you can do that here.

        return new Response(null, {
            headers: corsHeaders,
        })
    } else {
        // Handle standard OPTIONS request.
        // If you want to allow other HTTP Methods, you can do that here.
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, OPTIONS',
            },
        })
    }
}

/**
 *
 * @param resp Response that hit cache
 * @returns Response with X-Worker-Cache Header
 */

export function HandleCachedResponse(resp: Response): Response {
    const newHeaders = new Headers(resp.headers)
    newHeaders.set('X-Worker-Cache', 'HIT')
    return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: newHeaders,
    })
}
