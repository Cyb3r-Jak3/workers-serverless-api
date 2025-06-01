import type { Context } from 'hono'

export type DefinedContext = Context<{ Bindings: Env }>
