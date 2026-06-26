import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    reporter: 'html',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        testIdAttribute: 'data-test',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
        },
        {
            name: 'safari',
            use: {
                ...devices['Desktop Safari'],
            },
        },
        {
            name: 'mobile',
            use: {
                ...devices['Galaxy S24'],
            },
        },
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 14 Pro'],
            },
        },
    ],
    webServer: {
        command: 'bun run dev -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
    },
})
