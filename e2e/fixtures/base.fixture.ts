import type { Page } from '@playwright/test'

export type BaseSelectors = object

export type FixtureSelectors<TSelectors extends object = object> =
  BaseSelectors & TSelectors

export class BaseFixture<TSelectors extends object = object> {
  protected readonly selectors: FixtureSelectors<TSelectors>

  constructor(
    protected readonly page: Page,
    selectors: TSelectors,
  ) {
    this.selectors = selectors
  }
}
