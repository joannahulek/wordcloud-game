import { expect, test } from '../../fixtures'

test.describe('home page', () => {
    test('renders home page', async ({ fixtures }) => {
        const { homePage } = fixtures

        await expect(homePage.root()).toBeVisible()
        await expect(homePage.header()).toBeVisible()
    })
})
