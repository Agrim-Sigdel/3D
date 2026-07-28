import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionTransition, useReducedMotion } from './reducedMotion.js';

/**
 * Content arriving: fade, with an optional travel and an optional defocus.
 *
 * Five versions of this exist in the library and they disagree on two axes,
 * both of which are real:
 *
 *   *When* — `FadeIn` and `KnowItAll`'s `Reveal` wait for the element to scroll
 *   into view. `Aster`'s `Rise` runs on mount, because Aster's entrance is a
 *   composed sequence rather than a response to scrolling. `Vex`'s `TimedFade`
 *   also runs on mount but on a timer, so a locked single-viewport page can
 *   stage itself — nothing there ever scrolls into view, so `whileInView` would
 *   simply never fire.
 *
 *   *How* — four use Framer. `Vex` deliberately does not, and that is the one
 *   decision in this file worth preserving verbatim: Vex puts forty-odd of
 *   these on screen at once, and every Framer component brings its own
 *   animation loop. A CSS transition on a boolean costs one class change and
 *   no per-frame JavaScript at all. At that count the difference is visible.
 *
 * So `engine` and `trigger` are separate props rather than one `variant`, and
 * all four combinations are legitimate:
 *
 *   framer + inView   the common case — `FadeIn`, `Reveal`
 *   framer + mount    a staged entrance — `Rise`
 *   css    + mount    many elements, no scroll — `TimedFade`
 *   css    + inView   many elements, long page — what `.anim-stagger` wants to
 *                     be, but scroll-aware and without a keyframe per variant
 *
 * ─── Units ───────────────────────────────────────────────────────────────────
 *
 * `delay` and `duration` are **seconds**, matching Framer and the three
 * Framer-based originals. `TimedFade` counted in milliseconds; its `delay={200}`
 * becomes `delay={0.2}`. One unit across both engines is worth the conversion.
 *
 * ─── Reduced motion ──────────────────────────────────────────────────────────
 *
 * Travel and blur are dropped and the timing goes to zero, so content appears
 * rather than arriving. It still appears — suppressing the animation must not
 * suppress the content, which is exactly what a bare `animation: none` on an
 * element sitting at `opacity: 0` would do.
 *
 * @example Vex — forty of these, no scroll, no animation loops
 * <SectionReveal engine="css" trigger="mount" delay={0.2} duration={1} y={0}>
 *
 * @example KnowItAll — enters when it scrolls up, from the left
 * <SectionReveal x={-40} y={0} margin="-100px">
 */

/**
 * Resolved once at module load. `motion.create(as)` during render returns a
 * fresh component type every time, which remounts the subtree and restarts the
 * animation it was supposed to be running — the bug this table exists to avoid.
 */
const MOTION_TAGS = {
    div: motion.div,
    section: motion.section,
    nav: motion.nav,
    header: motion.header,
    footer: motion.footer,
    article: motion.article,
    aside: motion.aside,
    figure: motion.figure,
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    h4: motion.h4,
    p: motion.p,
    span: motion.span,
    ul: motion.ul,
    li: motion.li,
    a: motion.a,
};

/** Framer's default curve here is `FadeIn`'s, which is the house feel. */
const DEFAULT_EASE = [0.25, 0.1, 0.25, 1];

export default function SectionReveal({
    as = 'div',
    engine = 'framer',
    trigger = 'inView',
    x = 0,
    y = 30,
    blur = 0,
    delay = 0,
    duration = 0.7,
    ease = DEFAULT_EASE,
    once = true,
    margin = '50px',
    amount = 0,
    className = '',
    style,
    children,
    ...rest
}) {
    const reduced = useReducedMotion();

    /* One place decides what "reduced" means for this component: no travel, no
     * defocus, no waiting. Everything below reads these, not the raw props. */
    const dx = reduced ? 0 : x;
    const dy = reduced ? 0 : y;
    const dblur = reduced ? 0 : blur;

    const transition = useMotionTransition({ delay, duration, ease });

    if (engine === 'css') {
        return (
            <CssReveal
                as={as}
                trigger={trigger}
                x={dx}
                y={dy}
                blur={dblur}
                delay={reduced ? 0 : delay}
                duration={reduced ? 0 : duration}
                once={once}
                margin={margin}
                className={className}
                style={style}
                {...rest}
            >
                {children}
            </CssReveal>
        );
    }

    const Tag = MOTION_TAGS[as] ?? motion.div;

    const from = { opacity: 0, x: dx, y: dy };
    const to = { opacity: 1, x: 0, y: 0 };

    /* `filter` is only named when it is actually used. Animating it
     * unconditionally would promote every revealed element to its own layer for
     * a blur of zero pixels. */
    if (dblur) {
        from.filter = `blur(${dblur}px)`;
        to.filter = 'blur(0px)';
    }

    const timing =
        trigger === 'mount'
            ? { initial: from, animate: to }
            : { initial: from, whileInView: to, viewport: { once, margin, amount } };

    return (
        <Tag className={className} style={style} transition={transition} {...timing} {...rest}>
            {children}
        </Tag>
    );
}

/**
 * The no-animation-loop path: one state flip, one CSS transition.
 *
 * `trigger="mount"` is a timer. `trigger="inView"` is an IntersectionObserver,
 * which is what `whileInView` uses underneath anyway — the saving is Framer's
 * per-frame value pipeline, not the observer.
 *
 * The observer is created against the viewport rather than the scroll frame:
 * every template here is a full-viewport fixed page, so the frame and the
 * viewport are the same rectangle and intersection is already correct. That is
 * the same reasoning `frameContext.js` gives for `useInView` needing no
 * equivalent to `useScrollFrame`.
 */
function CssReveal({
    as: Tag = 'div',
    trigger,
    x,
    y,
    blur,
    delay,
    duration,
    once,
    margin,
    className,
    style,
    children,
    ...rest
}) {
    const [shown, setShown] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (trigger !== 'mount') return undefined;

        /* A zero delay still goes through the timer rather than initialising
         * `shown` to true: the element has to paint once at opacity 0 for the
         * transition to have somewhere to start from. */
        const timer = window.setTimeout(() => setShown(true), delay * 1000);
        return () => window.clearTimeout(timer);
    }, [trigger, delay]);

    useEffect(() => {
        if (trigger === 'mount') return undefined;

        const element = ref.current;
        if (!element) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setShown(false);
                }
            },
            { rootMargin: margin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [trigger, once, margin]);

    const transform = shown ? 'none' : `translate3d(${x}px, ${y}px, 0)`;
    const filter = blur ? (shown ? 'blur(0px)' : `blur(${blur}px)`) : undefined;

    return (
        <Tag
            ref={ref}
            className={className}
            style={{
                opacity: shown ? 1 : 0,
                transform,
                filter,
                transitionProperty: blur ? 'opacity, transform, filter' : 'opacity, transform',
                transitionDuration: `${duration}s`,
                /* The delay is spent in the timer, not the transition — adding it
                 * here too would double it. `inView` has no timer, so it pays the
                 * delay here instead. */
                transitionDelay: trigger === 'mount' ? '0s' : `${delay}s`,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                ...style,
            }}
            {...rest}
        >
            {children}
        </Tag>
    );
}
