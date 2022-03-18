export function JSONResponse(
    ResponseData: string | unknown,
    status = 200,
    extra_headers?: string[][]
): Response {
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

export function JSONErrorResponse(errMessage: string, status = 500): Response {
    return JSONResponse({ Error: errMessage }, status)
}
