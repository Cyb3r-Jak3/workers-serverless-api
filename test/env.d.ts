import { ENV } from '../src/types'
declare module "cloudflare:test" {
	// Controls the type of `import("cloudflare:test").env`
	interface ProvidedEnv extends ENV {}
}