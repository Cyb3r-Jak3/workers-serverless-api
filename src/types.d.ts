import type { Context } from 'hono'

export type DefinedContext = Context<{ Bindings: Env }>

// Augment CacheStorage to include Cloudflare Workers' `default` cache,
// which lib.dom.d.ts omits (pulled in transitively via @openpgp/web-stream-tools).
declare global {
    interface CacheStorage {
        readonly default: Cache
    }
}
