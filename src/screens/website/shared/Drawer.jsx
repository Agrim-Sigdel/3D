import React, { useId, useRef } from 'react';
import { useEscape, useFocusTrap, useScrollLock } from './overlay.js';
import { useMotionMs } from './reducedMotion.js';

/**
 * A panel docked to one edge, over a scrim — a cart, a quick-view, a filter
 * tray. Nothing in the library had one; `MobileMenu`'s `sheet` variant is the
 * closest, and it is deliberately not this.
 *
 * ─── Why not just use `MobileMenu variant="sheet"` ───────────────────────────
 *
 * They look alike and behave differently in the two ways that matter. A sheet is
 * navigation: it is one panel per page, it is content-height, and its whole job
 * is to be dismissed. A drawer is a *surface* — it scrolls internally, it can be
 * opened repeatedly with different content, and it usually has a header that
 * stays put while the body moves. Bolting `overflow-y: auto`, a sticky header
 * slot and a `size` axis onto `MobileMenu` would have made a component whose
 * three variants already differ in mechanism carry a fourth that differs in
 * purpose.
 *
 * ─── Sizing ──────────────────────────────────────────────────────────────────
 *
 * `size` is a Tailwind class, not a number, because the sensible value differs
 * per axis and per breakpoint: a right-hand drawer wants `w-full max-w-md`, a
 * bottom one wants `h-[80svh]`. `svh` rather than `vh` on the vertical axis —
 * mobile browsers shrink the viewport as their chrome retracts, and `vh` leaves
 * a drawer taller than the screen for the first scroll.
 *
 * @example WanderGear — product quick-view off the right edge
 * <Drawer open={!!item} onClose={close} side="right" label={item?.name}
 *         className="bg-gear-bg" size="w-full max-w-md">
 *     <Drawer.Header onClose={close}>{item?.name}</Drawer.Header>
 *     <Drawer.Body>…</Drawer.Body>
 * </Drawer>
 */

const SIDES = {
    right: { anchor: 'justify-end', hidden: 'translateX(100%)', fill: 'h-full' },
    left: { anchor: 'justify-start', hidden: 'translateX(-100%)', fill: 'h-full' },
    top: { anchor: 'items-start', hidden: 'translateY(-100%)', fill: 'w-full' },
    bottom: { anchor: 'items-end', hidden: 'translateY(100%)', fill: 'w-full' },
};

const HORIZONTAL = { right: true, left: true };

export default function Drawer({
    open = false,
    onClose,
    side = 'right',
    /** Tailwind sizing for the cross axis. See the note above. */
    size,
    label,
    labelledBy,
    closeOnScrim = true,
    closeOnEscape = true,
    lockScroll = true,
    restoreFocus = true,
    duration = 400,
    className = '',
    scrimClassName = 'bg-black/60',
    children,
    ...rest
}) {
    const panelRef = useRef(null);
    const ms = useMotionMs(duration);
    const id = useId();

    useEscape(open && closeOnEscape, onClose);
    useScrollLock(open && lockScroll);
    useFocusTrap(open, panelRef, { restoreFocus });

    const config = SIDES[side] ?? SIDES.right;
    const extent = size ?? (HORIZONTAL[side] ? 'w-full max-w-md' : 'h-[80svh]');

    return (
        <div
            className={`fixed inset-0 z-50 flex ${config.anchor} ${
                open ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            inert={!open}
        >
            {/* A real element rather than a `::before`, because clicking it is
             * the affordance and a pseudo-element cannot take the handler. */}
            <div
                role="presentation"
                onClick={closeOnScrim ? onClose : undefined}
                className={`absolute inset-0 ${scrimClassName}`}
                style={{
                    opacity: open ? 1 : 0,
                    transitionProperty: 'opacity',
                    transitionDuration: `${ms}ms`,
                    transitionTimingFunction: 'ease',
                }}
            />

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={labelledBy ? undefined : label}
                aria-labelledby={labelledBy}
                tabIndex={-1}
                id={`${id}-panel`}
                className={`relative flex flex-col outline-none ${config.fill} ${extent} ${className}`}
                style={{
                    transform: open ? 'none' : config.hidden,
                    transitionProperty: 'transform',
                    transitionDuration: `${ms}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                {...rest}
            >
                {children}
            </div>
        </div>
    );
}

/** A header that stays put while `Drawer.Body` scrolls under it. */
function DrawerHeader({ onClose, closeLabel = 'Close', className = '', children, ...rest }) {
    return (
        <div
            className={`flex shrink-0 items-center justify-between gap-4 ${className}`}
            {...rest}
        >
            <div className="min-w-0">{children}</div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={closeLabel}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-current/10 text-current transition-opacity hover:opacity-70"
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
        </div>
    );
}

/**
 * The scrolling region. `.ui-scroll` is the thin `currentColor` scrollbar from
 * `index.css` — the default one is the wrong colour on every dark surface here.
 */
function DrawerBody({ className = '', children, ...rest }) {
    return (
        <div className={`ui-scroll min-h-0 flex-1 overflow-y-auto ${className}`} {...rest}>
            {children}
        </div>
    );
}

/** A footer pinned below the scrolling body — totals, a primary action. */
function DrawerFooter({ className = '', children, ...rest }) {
    return (
        <div className={`shrink-0 ${className}`} {...rest}>
            {children}
        </div>
    );
}

Drawer.Header = DrawerHeader;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;
