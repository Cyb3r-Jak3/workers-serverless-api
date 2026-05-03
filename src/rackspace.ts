import { DefinedContext } from './types'
const RACKSPACE_BASE_URL = 'https://rackspace-monitor.cyberjake.xyz/'
export async function RackspaceBidHistoryEndpoint(
    c: DefinedContext
): Promise<Response> {
    return fetch(
        `${RACKSPACE_BASE_URL}bid_history/${c.req.param('server_class')}`
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
        return fetch(`${RACKSPACE_BASE_URL}server_classes/list`)
    }
    return fetch(`${RACKSPACE_BASE_URL}server_classes/${choice}`)
}

export async function RackspaceResponseTimeEndpoint(): Promise<Response> {
    return fetch(`${RACKSPACE_BASE_URL}response_time`)
}
