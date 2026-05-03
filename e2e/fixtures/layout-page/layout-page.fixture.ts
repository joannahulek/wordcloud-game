import type { Locator, Page } from '@playwright/test'
import { BaseFixture } from '../base.fixture'
import {
  createFixtureEntry,
  type NamedFixtureContext,
} from '../../utils/create-fixture-entry'

type Selectors = {
  LayoutRoot: string;
  LayoutBackground: string;
  LayoutContent: string;
}

export class LayoutPageFixture extends BaseFixture<Selectors> {
  private static readonly selectors: Selectors = {
    LayoutRoot: 'layout-root',
    LayoutBackground: 'layout-background',
    LayoutContent: 'layout-content',
  }

  constructor(readonly page: Page) {
    super(page, LayoutPageFixture.selectors)
  }

  async goto() {
    await this.page.goto('/')
  }

  root(): Locator {
    return this.page.getByTestId(this.selectors.LayoutRoot)
  }

  background(): Locator {
    return this.page.getByTestId(this.selectors.LayoutBackground)
  }

  content(): Locator {
    return this.page.getByTestId(this.selectors.LayoutContent)
  }
}

export const layoutFixture = createFixtureEntry('layoutPage', LayoutPageFixture)

export type LayoutFixtureContext =
  NamedFixtureContext<'layoutPage', LayoutPageFixture>
