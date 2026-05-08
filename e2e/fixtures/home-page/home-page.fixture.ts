import type { Locator, Page } from '@playwright/test'
import { BaseFixture } from '../base.fixture'

type Selectors = {
    homePageRoot: string,
    homePageHeader: string,
}

export class HomePageFixture extends BaseFixture<Selectors> {
    private static readonly selectors: Selectors = {
        homePageRoot: 'home-page',
        homePageHeader: 'home-page-header',
    }

    constructor(readonly page: Page) {
        super(page, HomePageFixture.selectors)
    }

    async goto() {
        await this.page.goto('/')
    }

    root(): Locator {
        return this.page.getByTestId(this.selectors.homePageRoot)
    }

    header(): Locator {
        return this.page.getByTestId(this.selectors.homePageHeader)
    }
}
