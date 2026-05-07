import type { Page } from '@playwright/test'

type NavigableFixture = {
    goto(): Promise<void>
}

type FixtureConstructor<TFixture extends NavigableFixture> = new (
    page: Page,
) => TFixture

export type NamedFixtureContext<
    TName extends string,
    TFixture extends NavigableFixture,
> = {
    [K in TName]: TFixture
}

export type FixtureEntry<
    TName extends string,
    TFixture extends NavigableFixture,
> = {
    name: TName
    fixture: (
        args: { page: Page },
        use: (fixture: TFixture) => Promise<void>,
    ) => Promise<void>
}

export function createFixtureEntry<
    TName extends string,
    TFixture extends NavigableFixture,
>(
    name: TName,
    Fixture: FixtureConstructor<TFixture>,
): FixtureEntry<TName, TFixture> {
    const fixture = async (
        { page }: { page: Page },
        use: (fixture: TFixture) => Promise<void>,
    ) => {
        const instance = new Fixture(page)

        await instance.goto()
        await use(instance)
    }

    return {
        name,
        fixture,
    }
}
