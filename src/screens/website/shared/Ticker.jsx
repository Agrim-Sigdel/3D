import React, { Children, useEffect, useRef } from 'react';
import { useReducedMotion } from './reducedMotion.js';
import { useScrollFrame } from './frameContext.js';

/**
 * A row that scrolls forever. Written four times before this file —
 * `Skyline.jsx:326` (Framer), `MichaelSmith.jsx:628` (GSAP),
 * `Jack.jsx:248` (scroll-driven) and `Aluma.jsx:347`.
 *
 * ─── Two engines, and the difference is real ─────────────────────────────────
 *
 *   `time`    A CSS animation at a constant rate, regardless of the page.
 *
 *   `scroll`  `transform` driven by the frame's scroll position, so the marquee
 *             tracks the reader — and, uniquely, **reverses when they scroll
 *             up**. `Jack` is the original and that reversal is the point of it.
 *
 * Neither is a default. A logo wall wants `time`; a band of words that should
 * feel attached to the page wants `scroll`.
 *
 * ─── Why `time` is CSS and not Framer ────────────────────────────────────────
 *
 * Three of the four originals used a JS engine, and all three would have had to
 * fake `pauseOnHover`. Stopping a Framer repeat means cancelling the animation
 * and starting a new one, which either snaps back to the start or has to be
 * hand-seeded with the current value; GSAP has `.pause()` but brings a timeline
 * per marquee. `animation-play-state: paused` freezes the track exactly where it
 * is and resumes from there, in one declaration and no JavaScript at all.
 *
 * It also costs no animation loop, which is the argument `CATALOGUE.md` makes
 * about `Vex`: a page with a marquee usually has a dozen other things moving.
 *
 * ─── Why the content is duplicated ───────────────────────────────────────────
 *
 * The track holds two copies of `children` and travels exactly `-50%`, so the
 * moment the first copy has left, the second is sitting precisely where the
 * first began and the reset is invisible. Animating to `-100%` of a single copy
 * shows empty space; measuring the content and animating in pixels breaks on
 * resize and on late-loading webfonts. This needs no measurement at all.
 *
 * The duplicate is `aria-hidden` and `inert` — the same eight logos must not be
 * read out twice, nor be tab stops that scroll away under the keyboard.
 *
 * ─── Reduced motion ──────────────────────────────────────────────────────────
 *
 * The track stops. It is not hidden: the content is still there and still
 * readable, it simply does not travel. An infinite marquee is close to the top
 * of the list of things `prefers-reduced-motion` is asking about. The `time`
 * engine is covered by the media query in `index.css`; the `scroll` engine
 * checks the hook and never attaches its listener.
 *
 * @example Coinwise — a price strip that stops when you want to read it
 * <Ticker duration={40} pauseOnHover fadeClassName="from-coinwise-bg">
 *     {PRICES.map(p => <Price key={p.symbol} {...p} />)}
 * </Ticker>
 *
 * @example Jack — attached to the page, reverses on scroll up
 * <Ticker engine="scroll" distance={0.8}>…</Ticker>
 */
export default function Ticker({
    engine = 'time',
    /** Seconds for one full pass. Higher is slower. */
    duration = 40,
    direction = 'left',
    /** `scroll` only: how far the track travels over one full page scroll. */
    distance = 0.5,
    pauseOnHover = false,
    /** Gradient edge fades. Pass the page colour, e.g. `from-skyline-bg`. */
    fadeClassName,
    fadeWidth = 'w-32',
    gap = 'gap-16',
    className = '',
    trackClassName = '',
    children,
    ...rest
}) {
    const reduced = useReducedMotion();
    const frame = useScrollFrame();
    const trackRef = useRef(null);

    const sign = direction === 'right' ? 1 : -1;

    /*
     * The scroll engine writes `transform` straight to the element rather than
     * going through state or a motion value. This runs on every scroll event of
     * a page that may already have a dozen animations on it, and the rule from
     * `README.md` is absolute: never `setState` per frame.
     *
     * It reads the *frame*, not the window. Every template here is a fixed page
     * that scrolls internally, so `window.scrollY` is a constant zero — see the
     * scroll gotcha in `README.md`.
     */
    useEffect(() => {
        if (engine !== 'scroll' || reduced) return undefined;

        const scroller = frame?.current;
        const track = trackRef.current;
        if (!scroller || !track) return undefined;

        let queued = false;

        const write = () => {
            queued = false;
            const range = scroller.scrollHeight - scroller.clientHeight;
            const progress = range > 0 ? scroller.scrollTop / range : 0;
            /* Halved, because the track is two copies wide — 50% is one copy. */
            const percent = sign * progress * distance * 50;
            track.style.transform = `translate3d(${percent}%, 0, 0)`;
        };

        const onScroll = () => {
            /* Coalesced to one write per frame. A trackpad fires scroll far
             * faster than the compositor can use. */
            if (queued) return;
            queued = true;
            requestAnimationFrame(write);
        };

        write();
        scroller.addEventListener('scroll', onScroll, { passive: true });
        return () => scroller.removeEventListener('scroll', onScroll);
    }, [engine, reduced, frame, sign, distance]);

    /* Two copies. `Children.toArray` keys them, so the duplicate does not
     * collide with the original in React's reconciler. */
    const copy = Children.toArray(children);

    const animation =
        engine === 'time'
            ? sign === -1
                ? 'animate-ticker-left'
                : 'animate-ticker-right'
            : '';

    return (
        <div
            className={`relative overflow-hidden ${
                pauseOnHover && engine === 'time' ? 'ticker-pausable' : ''
            } ${className}`}
            {...rest}
        >
            <div
                ref={trackRef}
                className={`flex w-max items-center ${gap} ${animation} ${trackClassName}`}
                style={engine === 'time' ? { '--ticker-duration': `${duration}s` } : undefined}
            >
                <div className={`flex shrink-0 items-center ${gap}`}>{copy}</div>
                <div className={`flex shrink-0 items-center ${gap}`} aria-hidden="true" inert>
                    {copy}
                </div>
            </div>

            {fadeClassName && (
                <>
                    <div
                        className={`pointer-events-none absolute inset-y-0 left-0 ${fadeWidth} bg-gradient-to-r to-transparent ${fadeClassName}`}
                    />
                    <div
                        className={`pointer-events-none absolute inset-y-0 right-0 ${fadeWidth} bg-gradient-to-l to-transparent ${fadeClassName}`}
                    />
                </>
            )}
        </div>
    );
}
