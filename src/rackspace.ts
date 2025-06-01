import { DefinedContext } from './types'

export async function RackspaceBidHistoryEndpoint(
    c: DefinedContext
): Promise<Response> {
    const server_class = c.req.param('server_class')
    return c.env.RACKSPACE_MONITOR.fetch(
        `http://example.com/bid_history/${server_class}`
    )
}

export async function RackspaceResponseTimeEndpoint(
    c: DefinedContext
): Promise<Response> {
    return c.env.RACKSPACE_MONITOR.fetch(`http://example.com/response_time`)
}
