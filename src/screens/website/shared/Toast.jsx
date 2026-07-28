import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useMotionMs, useReducedMotion } from './reducedMotion.js';

/**
 * A transient confirmation — "Reserved", "Copied", "Something went wrong".
 *
 * ─── Controlled, not a provider ──────────────────────────────────────────────
 *
 * `open` and `onClose` props rather than a `<ToastProvider>` and a `useToast()`
 * hook. Every template in this folder is a self-contained page mounted by the
 * router; there is no app shell to hang a provider off, and a hook exported
 * beside a component would cost this file its fast-refresh boundary — the same
 * reason `frameContext.js` and `overlay.js` are separate modules. One toast at
 * a time also matches what these pages actually do: acknowledge one submit.
 *
 * ─── `role="status"`, not `role="alert"` ─────────────────────────────────────
 *
 * `status` is a polite live region: it waits for the screen reader to finish the
 * sentence it is on. `alert` interrupts, which is right for "your session
 * expired" and wrong for "thanks, we'll be in touch". Pass `tone="assertive"`
 * for the interrupting kind.
 *
 * The live region is rendered unconditionally and its *content* is what changes.
 * Mounting the region and its text in the same tick is the classic way to have
 * nothing announced at all — the region has to exist before it can be observed.
 *
 * ─── Auto-dismiss pauses on hover and focus ──────────────────────────────────
 *
 * A toast that vanishes while it is being read, or while the pointer is on its
 * way to the close button, is worse than one that stays. Under reduced motion
 * the timer is left alone: the preference asks for less movement, not less time.
 *
 * @example Measured — acknowledging the reserve form
 * <Toast open={sent} onClose={() => setSent(false)}
 *        className="bg-white text-black">Reserved. Check your inbox.</Toast>
 */

const POSITIONS = {
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'bottom-right': 'right-6 bottom-6',
    'bottom-left': 'bottom-6 left-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
};

/** Which way it travels in from — off the edge it is docked to. */
const OFFSETS = {
    'bottom-center': 'translate(-50%, 16px)',
    'bottom-right': 'translateY(16px)',
    'bottom-left': 'translateY(16px)',
    'top-center': 'translate(-50%, -16px)',
    'top-right': 'translateY(-16px)',
};

/** Held so the transform is identical to the class-based one when open. */
const RESTING = {
    'bottom-center': 'translate(-50%, 0)',
    'bottom-right': 'none',
    'bottom-left': 'none',
    'top-center': 'translate(-50%, 0)',
    'top-right': 'none',
};

export default function Toast({
    open = false,
    onClose,
    /** Milliseconds before auto-dismiss. `0` keeps it up until closed. */
    timeout = 5000,
    position = 'bottom-center',
    tone = 'polite',
    showClose = true,
    duration = 300,
    className = 'rounded-full bg-black px-5 py-3 text-sm text-white shadow-2xl',
    children,
    ...rest
}) {
    const ms = useMotionMs(duration);
    const reduced = useReducedMotion();
    const pausedRef = useRef(false);
    const timerRef = useRef(null);

    /* The timer is re-armed whenever `children` changes as well as on open, so
     * a second toast replacing a first gets its own full reading time rather
     * than inheriting the remainder of the previous one's. */
    useEffect(() => {
        if (!open || !timeout || !onClose) return undefined;

        const start = () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                if (pausedRef.current) {
                    /* Still hovered — check again rather than dismissing under
                     * the cursor. Cheaper than tracking elapsed time, and the
                     * granularity does not matter for a 5s toast. */
                    start();
                    return;
                }
                onClose();
            }, timeout);
        };

        start();
        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = null;
        };
    }, [open, timeout, onClose, children]);

    return (
        <div
            role="status"
            aria-live={tone === 'assertive' ? 'assertive' : 'polite'}
            aria-atomic="true"
            onPointerEnter={() => {
                pausedRef.current = true;
            }}
            onPointerLeave={() => {
                pausedRef.current = false;
            }}
            onFocusCapture={() => {
                pausedRef.current = true;
            }}
            onBlurCapture={() => {
                pausedRef.current = false;
            }}
            className={`pointer-events-none fixed z-[60] flex items-center gap-3 ${
                POSITIONS[position] ?? POSITIONS['bottom-center']
            } ${open ? 'pointer-events-auto' : ''} ${className}`}
            style={{
                opacity: open ? 1 : 0,
                transform: open
                    ? RESTING[position] ?? 'none'
                    : reduced
                      ? RESTING[position] ?? 'none'
                      : OFFSETS[position] ?? OFFSETS['bottom-center'],
                transitionProperty: 'opacity, transform',
                transitionDuration: `${ms}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                visibility: open ? 'visible' : 'hidden',
            }}
            {...rest}
        >
            {/* Only the message is inside the atomic live region's content, so
             * the close button's label is not read out as part of it. */}
            <span className="min-w-0">{open ? children : null}</span>

            {showClose && onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss"
                    className="-mr-1 shrink-0 cursor-pointer border-none bg-transparent p-1 text-current opacity-60 transition-opacity hover:opacity-100"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
