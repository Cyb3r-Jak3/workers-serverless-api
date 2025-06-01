import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
    define: {
        PRODUCTION: 'true',
    },
    test: {
        deps: {
			optimizer: {
				ssr: {
					enabled: true,
					include: ["@microlabs/otel-cf-workers"],
				},
			},
		},
        poolOptions: {
            workers: {
                isolatedStorage: true,
                wrangler: {
                    configPath: './wrangler.toml',
                },
            },
        },
    },
    timeout: 60000,
})
