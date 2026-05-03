import { expect, test } from '../../fixtures'

test.describe('layout', () => {
  test('renders the layout shell above the background image', async ({ fixtures }) => {
    const { layoutPage } = fixtures

    await expect(layoutPage.root()).toBeVisible()
    await expect(layoutPage.background()).toBeVisible()
    await expect(layoutPage.content()).toBeVisible()
  })

  test('keeps the background centered and scaled responsively', async ({ fixtures }) => {
    const { layoutPage } = fixtures

    const styles = await layoutPage.background().evaluate((node) => {
      const computed = window.getComputedStyle(node)

      return {
        backgroundImage: computed.backgroundImage,
        backgroundPosition: computed.backgroundPosition,
        backgroundRepeat: computed.backgroundRepeat,
        backgroundSize: computed.backgroundSize,
      }
    })

    expect(styles.backgroundImage).not.toBe('none')
    expect(styles.backgroundRepeat).toBe('no-repeat')
    expect(styles.backgroundSize).toBe('cover')
  })
})
