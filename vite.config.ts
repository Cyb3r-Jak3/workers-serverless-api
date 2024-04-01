import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    define: {
        PRODUCTION: 'true',
    },
    test: {
        poolOptions: {
            workers: {
                isolatedStorage: false,
                wrangler: {
                    configPath: './wrangler.toml',
                },
            },
        },
    },
    timeout: 10000,
})
