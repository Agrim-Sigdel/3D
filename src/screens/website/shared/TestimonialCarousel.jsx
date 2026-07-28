import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionTransition, useReducedMotion } from './reducedMotion.js';

/**
 * One quote at a time, with a way to reach the others.
 * `Basilico.jsx:680` and `Aluma.jsx:638`.
 *
 * ─── Keyed remount, not a slide ──────────────────────────────────────────────
 *
 * Both originals key the blockquote on the active item so React swaps the node
 * and the entrance replays. That is kept, because it is the right mechanism
 * here: quotes are different lengths, so a horizontal track would need every
 * slide measured, and the container would jump between heights anyway. A fade
 * and a small lift needs no measurement and does not care that one review is
 * two lines and the next is six.
 *
 * ─── Autoplay ────────────────────────────────────────────────────────────────
 *
 * Off by default. When on:
 *
 *   - it stops permanently on any interaction — a dot press, an arrow key, a
 *     focus landing inside. A carousel that resumes after the reader has taken
 *     control moves the thing they were reading, which is the single worst
 *     behaviour this component can have.
 *   - it pauses while hovered, and while the tab is hidden (`visibilitychange`),
 *     so returning to the page does not find it eight quotes further on.
 *   - it does not run at all under reduced motion. An automatic content swap is
 *     movement the reader did not ask for.
 *
 * ─── Announcing ──────────────────────────────────────────────────────────────
 *
 * The region is `aria-live="polite"` only while autoplay is running. When the
 * reader is driving, the change is a result of their own press and announcing
 * it again is noise; when the component is driving, it is the only way to know
 * the content changed. `aria-roledescription="carousel"` names the pattern.
 *
 * ─── Dots ────────────────────────────────────────────────────────────────────
 *
 * Real buttons with `aria-label`s naming the item they lead to, not indices.
 * "Slide 3 of 5" tells a screen-reader user nothing about whether they want it.
 *
 * @example Mindful
 * <TestimonialCarousel items={REVIEWS} autoplay interval={7000}
 *     dotClassName="bg-white/20" activeDotClassName="w-10 bg-mindful-gold">
 *     {item => <Quote {...item} />}
 * </TestimonialCarousel>
 */
export default function TestimonialCarousel({
    items = [],
    autoplay = false,
    /** Milliseconds per quote. */
    interval = 8000,
    /** `item => string`, for each dot's accessible name. */
    labelFor = item => item.name ?? item.title ?? '',
    className = '',
    dotsClassName = 'mt-12 flex items-center gap-3',
    dotClassName = 'h-1.5 w-4 rounded-full bg-current/20',
    activeDotClassName = 'h-1.5 w-10 rounded-full bg-current',
    children,
    ...rest
}) {
    const [index, setIndex] = useState(0);
    /* Latched, never unlatched — see the note on autoplay above. */
    const [taken, setTaken] = useState(false);
    const [hovered, setHovered] = useState(false);
    const reduced = useReducedMotion();

    const transition = useMotionTransition({ duration: 0.6, ease: 'easeOut' });
    const timerRef = useRef(null);

    const total = items.length;
    const running = autoplay && !taken && !hovered && !reduced && total > 1;

    const goTo = useCallback(next => {
        setTaken(true);
        setIndex(next);
    }, []);

    useEffect(() => {
        if (!running) return undefined;

        const tick = () => setIndex(current => (current + 1) % total);
        timerRef.current = window.setInterval(tick, interval);

        /* A background tab still fires intervals in most browsers, just
         * throttled — without this the carousel is several quotes on by the
         * time the reader comes back. */
        const onVisibility = () => {
            if (document.hidden) {
                window.clearInterval(timerRef.current);
            } else {
                timerRef.current = window.setInterval(tick, interval);
            }
        };

        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.clearInterval(timerRef.current);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [running, interval, total]);

    if (!total) return null;

    const active = items[index];

    return (
        <div
            aria-roledescription="carousel"
            /* Polite only while the component is driving. */
            aria-live={running ? 'polite' : 'off'}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={() => setTaken(true)}
            onKeyDown={event => {
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goTo((index + 1) % total);
                } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goTo((index - 1 + total) % total);
                }
            }}
            className={className}
            {...rest}
        >
            {/* The key is what replays the entrance — React swaps the node
             * rather than updating it in place. */}
            <motion.div
                key={index}
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
            >
                {children?.(active, { index, total })}
            </motion.div>

            {total > 1 && (
                <div className={dotsClassName}>
                    {items.map((item, i) => (
                        <button
                            key={item.id ?? labelFor(item) ?? i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={labelFor(item) || `Item ${i + 1}`}
                            aria-current={i === index}
                            className={`cursor-pointer border-none p-0 transition-all duration-500 ${
                                i === index ? activeDotClassName : dotClassName
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
