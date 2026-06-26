import React, { type CSSProperties, type ReactNode } from 'react'
import Bg1X from './assets/background.1X.webp'
import Bg2X from './assets/background.2X.webp'

import './layout.scoped.scss'

export function Layout({ children }: { children: ReactNode }) {
    const styles = React.useMemo(() => ({
        '--layout-background': `image-set(url("${Bg1X}") 1x, url("${Bg2X}") 2x)`,
    }) as CSSProperties, [])

    return (
        <div className="layout" style={styles} data-test="layout-root">
            <div
                className="layout-background"
                aria-hidden="true"
                data-test="layout-background"
            />
            <div className="hero" data-test="hero"><h1>Wordcloud game</h1></div>
            <div className="layout-content" data-test="layout-content">
                {children}
            </div>
        </div>
    )
}
