import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './reducedMotion.js';

/**
 * A number that counts up when it scrolls into view.
 *
 * `ROADMAP.md`: *"stat blocks exist in four templates and every one of them is a
 * static string."* This is the missing half of `StatBlock`.
 *
 * ─── No `setState` per frame ─────────────────────────────────────────────────
 *
 * The rule from `README.md`, and this is the component most likely to break it.
 * A count-up is sixty renders a second of a component whose only changing output
 * is a text node — so the text node is written directly through a ref and React
 * renders once. `VideoPlayer`'s progress bar and `Lithos`'s spotlight take the
 * same route.
 *
 * ─── Layout stability ────────────────────────────────────────────────────────
 *
 * `tabular-nums` fixes the width of a digit, but not the *count* of them: "0"
 * growing to "12,000" changes the element's width four times and drags whatever
 * sits beside it across the screen each time.
 *
 * So the final string is always rendered, `invisible` and `aria-hidden`, and the
 * live value is stacked on top of it in the same grid cell. The box is the width
 * of the number it is going to reach, from the first frame. One element in the
 * flow, one string announced, no reflow.
 *
 * ─── Easing ──────────────────────────────────────────────────────────────────
 *
 * `easeOutExpo`. A linear count reads like a loading spinner; the fast start and
 * long settle reads like an odometer, which is the thing being imitated. The
 * final frame is written from `to` rather than from the eased value, so the
 * number always lands exactly on target rather than on 11,999.6.
 *
 * ─── Reduced motion ──────────────────────────────────────────────────────────
 *
 * No count at all — the final value is simply there. This is the case
 * `reducedMotion.js` describes as suppressing movement while keeping state.
 *
 * @example Coinwise — the stat band
 * <AnimatedCounter to={12000} format={n => n.toLocaleString()} suffix="+" />
 */
export default function AnimatedCounter({
    to,
    from = 0,
    /** Seconds. */
    duration = 2,
    format,
    prefix = '',
    suffix = '',
    /** Fires the count this far before the element is fully in view. */
    margin = '-10%',
    as: Tag = 'span',
    className = '',
    ...rest
}) {
    const ref = useRef(null);
    /** The node the count writes into, separate from the width-reserving one. */
    const textRef = useRef(null);
    const [started, setStarted] = useState(false);
    const reduced = useReducedMotion();

    const render = value => `${prefix}${format ? format(value) : String(value)}${suffix}`;

    useEffect(() => {
        if (started || reduced) return undefined;

        const element = ref.current;
        if (!element) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { rootMargin: margin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [started, reduced, margin]);

    useEffect(() => {
        if (!started || reduced) return undefined;

        const element = textRef.current;
        if (!element) return undefined;

        let frame = 0;
        let start = null;
        const span = to - from;
        const ms = duration * 1000;

        const tick = now => {
            if (start === null) start = now;
            const progress = Math.min((now - start) / ms, 1);

            /* easeOutExpo. Clamped at 1 so the final frame is exact rather than
             * 1 - 2^-10 short of it. */
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            /* Straight to the DOM. This is the whole point of the component. */
            element.textContent = render(Math.round(from + span * eased));

            if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
        /* `render` is intentionally not a dependency. It closes over `format`,
         * and an inline `format={n => …}` prop is a new function on every parent
         * render — listing it would restart the count from zero every time
         * anything above this component re-rendered. Hoist `format` to module
         * scope if it ever needs to change. */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, reduced, to, from, duration]);

    return (
        <Tag ref={ref} className={`inline-grid tabular-nums ${className}`} {...rest}>
            {/* Reserves the width of the number this is counting towards. */}
            <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                {render(to)}
            </span>

            {/* Stacked in the same cell. Under reduced motion it is simply the
             * final value, and with no JavaScript the markup is already correct. */}
            <span ref={textRef} className="col-start-1 row-start-1">
                {render(reduced || !started ? to : from)}
            </span>
        </Tag>
    );
}
