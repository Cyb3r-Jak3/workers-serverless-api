import type { Context } from 'hono'

export type DefinedContext = Context<{ Bindings: ENV }>

export type ENV = {
    KV: KVNamespace
    AE: AnalyticsEngineDataset
    GitHash: string
    BuiltTime: string
    ScrapeToken?: string
    ScrapeAccountID?: string
    ScrapeZoneID?: string
    PUBLIC_FILES: R2Bucket
    BASELIME_API_KEY: string
}
