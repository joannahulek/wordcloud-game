import { expect, test as base } from '@playwright/test'
import { type HomePageFixture, type HomePageFixtureContext, homePageFixture } from './home-page'
import { type LayoutPageFixture, type LayoutFixtureContext, layoutFixture } from './layout-page'

export type FixtureBag = {
    fixtures: {
        homePage: HomePageFixture
        layoutPage: LayoutPageFixture
    }
}

type AppFixtures =
  HomePageFixtureContext &
  LayoutFixtureContext &
  FixtureBag

const test = base.extend<AppFixtures>({
    homePage: homePageFixture.fixture,
    layoutPage: layoutFixture.fixture,
    fixtures: async ({ homePage, layoutPage }, use) => {
        await use({
            homePage,
            layoutPage,
        })
    },
})

export { expect, test }
