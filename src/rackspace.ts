import { JSONResponse, HandleCachedResponse } from '@cyb3r-jak3/workers-common'
import { DefinedContext, ENV } from './types'
import type { ExecutionContext, Response } from '@cloudflare/workers-types'

export enum RackspaceServerClass {
    GP_VS1_MEDIUM_DFW = 'gp.vs1.medium-dfw',
    GP_VS1_SMALL_DFW = 'gp.vs1.small-dfw',
    MH_VS1_LARGE_DFW = 'mh.vs1.large-dfw',
    MH_VS1_XLARGE_DFW = 'mh.vs1.xlarge-dfw',
    CH_VS1_MEDIUM_DFW = 'ch.vs1.medium-dfw',
    GP_BM2_LARGE_DFW = 'gp.bm2.large-dfw',
    MH_VS1_MEDIUM_DFW = 'mh.vs1.medium-dfw',
    GP_BM2_MEDIUM_DFW = 'gp.bm2.medium-dfw',
    MH_VS1_2XLARGE_DFW = 'mh.vs1.2xlarge-dfw',
    MH_VS1_2XLARGE_IAD = 'mh.vs1.2xlarge-iad',
    GP_VS1_2XLARGE_LON = 'gp.vs1.2xlarge-lon',
    GP_VS1_XLARGE_LON = 'gp.vs1.xlarge-lon',
    CH_VS1_XLARGE_IAD = 'ch.vs1.xlarge-iad',
    GP_BM2_MEDIUM_LON = 'gp.bm2.medium-lon',
    CH_VS1_MEDIUM_IAD = 'ch.vs1.medium-iad',
    GP_BM2_SMALL_LON = 'gp.bm2.small-lon',
    CH_VS1_2XLARGE_IAD = 'ch.vs1.2xlarge-iad',
    MH_VS1_XLARGE_IAD = 'mh.vs1.xlarge-iad',
    MH_VS1_LARGE_IAD = 'mh.vs1.large-iad',
    CH_VS1_LARGE_LON = 'ch.vs1.large-lon',
    GP_BM2_LARGE_LON = 'gp.bm2.large-lon',
    MH_VS1_2XLARGE_LON = 'mh.vs1.2xlarge-lon',
    CH_VS1_LARGE_IAD = 'ch.vs1.large-iad',
    GP_BM2_SMALL_IAD = 'gp.bm2.small-iad',
    CH_VS1_2XLARGE_LON = 'ch.vs1.2xlarge-lon',
    CH_VS1_MEDIUM_LON = 'ch.vs1.medium-lon',
    MH_VS1_MEDIUM_LON = 'mh.vs1.medium-lon',
    MH_VS1_LARGE_LON = 'mh.vs1.large-lon',
    MH_VS1_XLARGE_LON = 'mh.vs1.xlarge-lon',
    GP_VS1_SMALL_IAD = 'gp.vs1.small-iad',
    CH_VS1_XLARGE_LON = 'ch.vs1.xlarge-lon',
    IO_BM2_LON = 'io.bm2-lon',
    IO_BM2_IAD = 'io.bm2-iad',
    GP_VS1_LARGE_LON = 'gp.vs1.large-lon',
    CH_VS1_2XLARGE_DFW = 'ch.vs1.2xlarge-dfw',
    CH_VS1_XLARGE_DFW = 'ch.vs1.xlarge-dfw',
    GP_VS1_2XLARGE_IAD = 'gp.vs1.2xlarge-iad',
    MH_VS1_MEDIUM_IAD = 'mh.vs1.medium-iad',
    GP_VS1_LARGE_IAD = 'gp.vs1.large-iad',
    GP_VS1_LARGE_DFW = 'gp.vs1.large-dfw',
    CH_VS1_LARGE_DFW = 'ch.vs1.large-dfw',
    GP_VS1_MEDIUM_LON = 'gp.vs1.medium-lon',
    GP_VS1_XLARGE_DFW = 'gp.vs1.xlarge-dfw',
    GP_VS1_MEDIUM_IAD = 'gp.vs1.medium-iad',
    GP_VS1_XLARGE_IAD = 'gp.vs1.xlarge-iad',
}

// Optionally, if you still need an array of all values:
export const validRackspaceServerClasses = Object.values(RackspaceServerClass)

type RackspaceHistory = {
    auction: RackspaceServerClass
    history: {
        run_at: Date
        hammer_price: number
    }
}

export async function CollectRackspaceData(
    env: ENV,
    ctx: ExecutionContext
): Promise<void> {
    // This function is a placeholder for any future data collection logic
    // related to Rackspace. Currently, it does nothing.
    const baseURL =
        'https://ngpc-prod-public-data.s3.us-east-2.amazonaws.com/history'
    var allData: RackspaceHistory[] = []
    for (const serverClass of validRackspaceServerClasses) {
        const url = `${baseURL}/${serverClass}`
        const resp = await fetch(url, {
            headers: {
                'User-Agent': 'Cyb3rJak3 API',
                Accept: 'application/json',
            },
        })
        if (!resp.ok) {
            console.error(
                `Failed to fetch data for ${serverClass}: ${resp.statusText}`
            )
            continue
        }
        const data: RackspaceHistory = await resp.json()
        ctx.waitUntil(
            env.KV.put(
                `RACKSPACE_HISTORY_${serverClass}`,
                JSON.stringify(data),
                {
                    expirationTtl: 60 * 60 * 1, // 1 hour
                }
            )
        )
        allData.push(data)
    }
    ctx.waitUntil(
        env.KV.put('RACKSPACE_HISTORY_ALL', JSON.stringify(allData), {
            expirationTtl: 60 * 60 * 1, // 1 hour
        })
    )
}

export async function RackspaceEndpoint(c: DefinedContext): Promise<Response> {
    const cache = caches.default
    let response = await cache.match(c.req.raw)
    if (response) {
        return HandleCachedResponse(response)
    }
    const serverClass = c.req.param('server_class')
    if (!serverClass) {
        return JSONResponse(
            { error: 'server_class parameter is required' },
            { status: 400 }
        )
    }
    console.log(`RackspaceEndpoint called with server_class: ${serverClass}`)
    if (
        !validRackspaceServerClasses.includes(
            serverClass as RackspaceServerClass
        ) &&
        serverClass !== 'all'
    ) {
        return JSONResponse(
            { error: 'Invalid server_class parameter' },
            { status: 400 }
        )
    }
    let data: RackspaceHistory[] | RackspaceHistory | null = null
    if (serverClass === 'all') {
        data = await c.env.KV.get('RACKSPACE_HISTORY_ALL', { type: 'json' })
    } else {
        data = await c.env.KV.get(`RACKSPACE_HISTORY_${serverClass}`, {
            type: 'json',
        })
    }
    if (!data) {
        return JSONResponse(
            { error: 'No data found for the specified server_class' },
            { status: 404 }
        )
    }
    response = JSONResponse(data, {
        extra_headers: { 'Cache-Control': 'public, max-age=3600' }, // Cache for 1 hour
    })
    c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()))
    return response
}
