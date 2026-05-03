import type { Locator, Page } from '@playwright/test'
import { BaseFixture } from '../base.fixture'
import {
  createFixtureEntry,
  type NamedFixtureContext,
} from '../../utils/create-fixture-entry'

type Selectors = {
  HomePageRoot: string,
  Header: string,
}

export class HomePageFixture extends BaseFixture<Selectors> {
  public static readonly selectors: Selectors = {
    HomePageRoot: 'home-page',
    Header: 'home-page-header',
  }

  constructor(readonly page: Page) {
    super(page, HomePageFixture.selectors)
  }

  async goto() {
    await this.page.goto('/')
  }

  root(): Locator {
    return this.page.getByTestId(this.selectors.HomePageRoot)
  }

  header(): Locator {
    return this.page.getByTestId(this.selectors.Header)
  }
}

export const homePageFixture = createFixtureEntry('homePage', HomePageFixture)

export type HomePageFixtureContext =
  NamedFixtureContext<'homePage', HomePageFixture>
