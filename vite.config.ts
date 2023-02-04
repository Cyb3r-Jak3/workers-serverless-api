import {defineConfig} from 'vitest/config'

export default defineConfig({
    test: {
        environment: "miniflare",
        coverage: {
            // ToDo: Figure out how to collect coverage
            enabled: false,
        }
    }
})