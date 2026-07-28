import React from 'react';
import SectionReveal from './SectionReveal.jsx';

/**
 * Enter-on-scroll wrapper: slides in from (x, y) and fades up, once.
 *
 * Now a preset over `./SectionReveal`, which absorbed this component along with
 * `Aster`'s `Rise`, `KnowItAll`'s `Reveal` and `Vex`'s `TimedFade`. The props
 * and the defaults are unchanged, so the fifteen-odd call sites across the
 * library did not have to move; what they gain by the swap is `prefers-reduced-
 * motion` support, which this file never had.
 *
 * Reach for `SectionReveal` directly when you need what this cannot express —
 * a blur on entry, a mount trigger instead of a scroll one, or the CSS engine
 * for a page with too many of these to give each one an animation loop.
 */
export default function FadeIn({
    as = 'div',
    delay = 0,
    duration = 0.7,
    x = 0,
    y = 30,
    className = '',
    style,
    children,
    ...rest
}) {
    return (
        <SectionReveal
            as={as}
            delay={delay}
            duration={duration}
            x={x}
            y={y}
            className={className}
            style={style}
            {...rest}
        >
            {children}
        </SectionReveal>
    );
}
