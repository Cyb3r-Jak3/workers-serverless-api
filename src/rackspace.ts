import { DefinedContext } from './types'

export async function RackspaceBidHistoryEndpoint(
    c: DefinedContext
): Promise<Response> {
    const server_class = c.req.param('server_class')
    return c.env.RACKSPACE_MONITOR.fetch(
        `http://example.com/bid_history/${server_class}`
    )
}

export async function RackspaceMetaInfoEndpoint(
    c: DefinedContext
): Promise<Response> {
    const choice = c.req.param('choice')
    if (!choice || (choice !== 'regions' && choice !== 'server_classes')) {
        return new Response('Invalid choice parameter', { status: 400 })
    }
    if (choice === 'server_classes') {
        return c.env.RACKSPACE_MONITOR.fetch(
            `http://example.com/server_classes/list`
        )
    }
    return c.env.RACKSPACE_MONITOR.fetch(
        `http://example.com/server_classes/${choice}`
    )
}

export async function RackspaceResponseTimeEndpoint(
    c: DefinedContext
): Promise<Response> {
    return c.env.RACKSPACE_MONITOR.fetch(`http://example.com/response_time`)
}
