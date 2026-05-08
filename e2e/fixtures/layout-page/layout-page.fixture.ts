import type { Locator, Page } from '@playwright/test'
import { BaseFixture } from '../base.fixture'

type Selectors = {
    layoutRoot: string;
    layoutBackground: string;
    layoutContent: string;
}

export class LayoutPageFixture extends BaseFixture<Selectors> {
    private static readonly selectors: Selectors = {
        layoutRoot: 'layout-root',
        layoutBackground: 'layout-background',
        layoutContent: 'layout-content',
    }

    constructor(readonly page: Page) {
        super(page, LayoutPageFixture.selectors)
    }

    async goto() {
        await this.page.goto('/')
    }

    root(): Locator {
        return this.page.getByTestId(this.selectors.layoutRoot)
    }

    background(): Locator {
        return this.page.getByTestId(this.selectors.layoutBackground)
    }

    content(): Locator {
        return this.page.getByTestId(this.selectors.layoutContent)
    }
}
