import { expect, test as base } from '@playwright/test'
import { HomePageFixture } from './home-page'
import { LayoutPageFixture } from './layout-page'

export type FixtureBag = {
    fixtures: {
        homePage: HomePageFixture
        layoutPage: LayoutPageFixture
    }
}

const test = base.extend<FixtureBag>({
    fixtures: async ({ page }, use) => {
        const homePage = new HomePageFixture(page)
        const layoutPage = new LayoutPageFixture(page)

        await use({
            homePage,
            layoutPage,
        })
    },
})

export { expect, test }
