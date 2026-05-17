import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'bun:test'

import App from './App'

describe('App', () => {
    it('renders the main app container', () => {
        const markup = renderToStaticMarkup(createElement(App))

        expect(markup).toContain('data-test="main-app-container"')
    })
})
