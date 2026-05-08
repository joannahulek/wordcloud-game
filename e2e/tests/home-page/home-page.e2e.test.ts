import { expect, test } from '../../fixtures'

test.describe('home page', () => {
    test.beforeEach(async ({ fixtures: { homePage } }) => {
        await homePage.goto()
    })

    test('renders home page', async ({ fixtures }) => {
        const { homePage } = fixtures

        await expect(homePage.root()).toBeVisible()
        await expect(homePage.header()).toBeVisible()
    })
})
