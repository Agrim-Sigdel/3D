import React, { useId, useRef } from 'react';
import { useEscape, useFocusTrap, useScrollLock } from './overlay.js';
import { useMotionMs } from './reducedMotion.js';

/**
 * A centred dialog over a scrim. The base every other overlay in this folder is
 * built on — `VideoModal`, `Lightbox` and `Drawer` all compose it or its hooks.
 *
 * Structure and behaviour only, in the manner of `Select` and `DateField`:
 * `className` dresses the panel, `scrimClassName` the backdrop, and the caller
 * supplies its own close control through `children` or takes the default one.
 * Nothing here carries a palette.
 *
 * ─── Mounted, not unmounted ──────────────────────────────────────────────────
 *
 * The scrim stays in the tree and fades, because a dialog that vanishes on the
 * frame the state flips has no exit. What that costs is that `children` are
 * still mounted while closed, so anything expensive or *audible* has to be gated
 * by the caller — `VideoModal` renders its player only when open for exactly
 * that reason. `inert` keeps the closed tree out of the tab order meanwhile.
 *
 * ─── Scrim clicks ────────────────────────────────────────────────────────────
 *
 * Compared against `event.currentTarget`, not `closest()`. A press that starts
 * inside the panel and drags out — selecting text in a caption, say — lands its
 * click on the scrim, and a `closest()` test would read that as "clicked
 * outside" and close the dialog under the user's cursor.
 *
 * @example Adam — a case study, closed by Escape, scrim or the default button
 * <Modal open={!!study} onClose={close} label={study?.title}
 *        className="max-w-3xl rounded-none border border-white/15 bg-black">
 *     {study && <CaseStudy {...study} />}
 * </Modal>
 */
export default function Modal({
    open = false,
    onClose,
    /** Accessible name. Use `labelledBy` instead when the panel renders a heading. */
    label,
    labelledBy,
    describedBy,
    closeOnScrim = true,
    closeOnEscape = true,
    lockScroll = true,
    restoreFocus = true,
    /** The built-in ✕. Turn it off when the panel draws its own. */
    showClose = true,
    closeLabel = 'Close',
    duration = 300,
    className = '',
    scrimClassName = 'bg-black/80 backdrop-blur-sm',
    closeClassName = '',
    children,
    ...rest
}) {
    const panelRef = useRef(null);
    const ms = useMotionMs(duration);
    const id = useId();

    useEscape(open && closeOnEscape, onClose);
    useScrollLock(open && lockScroll);
    useFocusTrap(open, panelRef, { restoreFocus });

    return (
        <div
            role="presentation"
            onClick={event => {
                if (closeOnScrim && event.target === event.currentTarget) onClose?.();
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
            } ${scrimClassName}`}
            style={{
                transitionProperty: 'opacity',
                transitionDuration: `${ms}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            inert={!open}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={labelledBy ? undefined : label}
                aria-labelledby={labelledBy}
                aria-describedby={describedBy}
                tabIndex={-1}
                id={`${id}-panel`}
                className={`relative w-full outline-none ${className}`}
                style={{
                    /* The panel travels a little further than the scrim fades,
                     * so the two reads as one movement rather than a card
                     * appearing on a backdrop that is already there. */
                    transform: open ? 'none' : 'translateY(12px) scale(0.98)',
                    transitionProperty: 'transform',
                    transitionDuration: `${ms}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                {...rest}
            >
                {showClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={closeLabel}
                        className={`absolute top-4 right-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-black/60 text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${closeClassName}`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}

                {children}
            </div>
        </div>
    );
}
