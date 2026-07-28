import React, { useId, useRef, useState } from 'react';
import { useMotionMs } from './reducedMotion.js';

/**
 * A label that appears beside its trigger on hover *or* focus.
 *
 * ─── Focus, not just hover ───────────────────────────────────────────────────
 *
 * The reason this is a component rather than a `title` attribute or a
 * `group-hover:` utility. A hover-only tooltip does not exist for anyone driving
 * the page from the keyboard, and `title` is unstyleable, slow to appear, and
 * announced inconsistently. This binds `focus`/`blur` alongside
 * `pointerenter`/`pointerleave` and wires `aria-describedby`, so the content is
 * read out as part of the trigger rather than being a separate thing to find.
 *
 * Escape dismisses while the pointer is still over the trigger — required by
 * WAI-ARIA, and the practical case is a tooltip covering the thing underneath it.
 *
 * ─── Positioning ─────────────────────────────────────────────────────────────
 *
 * CSS only: absolute against a `relative` wrapper. No collision detection, no
 * floating-ui — that is a dependency and a measurement pass for something whose
 * placement is known at author time in every case this library has. Pick the
 * `placement` that fits and check it at the narrow breakpoint.
 *
 * The panel is `pointer-events-none`, so it can never intercept a click meant
 * for what it is describing, and `w-max` with a `max-w-*` so short labels stay
 * on one line rather than being squeezed by the trigger's width.
 *
 * @example Securify — a certification mark on the compliance strip
 * <Tooltip label="SOC 2 Type II — audited annually" placement="top">
 *     <button type="button" className="…">soc 2</button>
 * </Tooltip>
 */

const PLACEMENTS = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/** Which way the panel drifts in from. Matches the side it sits on. */
const OFFSETS = {
    top: 'translateY(4px)',
    bottom: 'translateY(-4px)',
    left: 'translateX(4px)',
    right: 'translateX(-4px)',
};

export default function Tooltip({
    label,
    placement = 'top',
    /** Hover-in delay. Zero on focus — a keyboard user has already committed. */
    delay = 120,
    duration = 150,
    className = '',
    panelClassName = 'rounded-lg bg-black px-2.5 py-1.5 text-xs text-white shadow-lg',
    children,
    ...rest
}) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef(null);
    const ms = useMotionMs(duration);
    const id = useId();

    const clear = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
    };

    const show = immediate => {
        clear();
        if (immediate || !delay) {
            setOpen(true);
            return;
        }
        timerRef.current = window.setTimeout(() => setOpen(true), delay);
    };

    const hide = () => {
        clear();
        setOpen(false);
    };

    return (
        <span
            className={`relative inline-flex ${className}`}
            onPointerEnter={() => show(false)}
            onPointerLeave={hide}
            /* Capture, so the tooltip opens even when focus lands on a control
             * nested inside the trigger rather than on the wrapper itself. */
            onFocusCapture={() => show(true)}
            onBlurCapture={hide}
            onKeyDown={event => {
                if (event.key === 'Escape' && open) {
                    event.stopPropagation();
                    hide();
                }
            }}
            {...rest}
        >
            {/* `aria-describedby` on the wrapper rather than cloned onto the
             * child: cloning would require the child to forward the prop, and
             * every caller would have to remember to. A describedby on the
             * containing element is resolved the same way by screen readers. */}
            <span aria-describedby={open ? id : undefined} className="contents">
                {children}
            </span>

            <span
                id={id}
                role="tooltip"
                className={`pointer-events-none absolute z-50 w-max max-w-[16rem] ${
                    PLACEMENTS[placement] ?? PLACEMENTS.top
                } ${panelClassName}`}
                style={{
                    opacity: open ? 1 : 0,
                    transform: open ? 'none' : OFFSETS[placement] ?? OFFSETS.top,
                    transitionProperty: 'opacity, transform',
                    transitionDuration: `${ms}ms`,
                    /* Hidden from the tree while closed, so the description is
                     * not announced as part of a trigger that is not showing it. */
                    visibility: open ? 'visible' : 'hidden',
                }}
            >
                {label}
            </span>
        </span>
    );
}
