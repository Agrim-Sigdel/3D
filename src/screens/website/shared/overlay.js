import { useEffect, useRef } from 'react';
import { useScrollFrame } from './frameContext.js';

/**
 * The four things every overlay in this library has to do, and that the eleven
 * hand-rolled ones scattered through the templates each did some subset of.
 *
 * `Modal`, `Drawer`, `Lightbox` and `VideoModal` all compose these. They live in
 * a `.js` file rather than beside any one of those components for two reasons:
 * nothing here renders, and a `.jsx` module that exports a hook alongside a
 * component is not fast-refreshable — the same reason `frameContext.js` is split
 * out of `PageFrame.jsx`.
 *
 * ─── What the originals got wrong ────────────────────────────────────────────
 *
 * **Scroll lock.** `Measured` locks `document.body`, which does nothing here.
 * Every template in this folder is a `position: fixed` page that scrolls *inside*
 * `PageFrame`, so the body has no scroll to lock and the page behind the overlay
 * keeps moving. `useScrollLock` freezes the frame from `useScrollFrame()` and
 * only falls back to the body when there is no frame.
 *
 * **Focus.** `Verde` and `NaturaVista`'s video modals never move focus. Opening
 * one leaves the keyboard behind the scrim, so Tab walks the page underneath —
 * invisible, and the close button is never reached.
 *
 * **Escape.** Listened for at the document rather than on the panel. A panel
 * listener only fires once something inside it has focus, which is exactly the
 * case that is broken when focus was never moved.
 */

/**
 * Everything tabbable, minus the things that only *look* tabbable.
 *
 * `[inert]` subtrees are excluded because `MobileMenu` marks closed panels inert
 * and a trapped modal must not cycle into one, and `[tabindex="-1"]` is excluded
 * because a panel's own programmatic-focus target is not a stop on the tab ring.
 */
const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
]
    .map(selector => `${selector}:not([inert] *):not([inert])`)
    .join(',');

/** Tabbable descendants of `root`, in document order, skipping hidden ones. */
function focusable(root) {
    if (!root) return [];
    return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        element => element.offsetWidth || element.offsetHeight || element.getClientRects().length
    );
}

/** Calls `onEscape` on Escape while `active`. Bound at the document — see above. */
export function useEscape(active, onEscape) {
    useEffect(() => {
        if (!active || !onEscape) return undefined;

        const onKeyDown = event => {
            if (event.key !== 'Escape') return;
            /* Stops a modal inside a menu from closing both at once. */
            event.stopPropagation();
            onEscape();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [active, onEscape]);
}

/**
 * Freezes one element's scrolling and returns the undo.
 *
 * Module scope rather than inline in the hook below, and that is not stylistic:
 * `react-hooks/immutability` rejects writing through a value that came out of a
 * hook, which `frameRef.current` is. Taking the element as a parameter puts the
 * mutation on an argument the rule can reason about, and the operation is
 * genuinely a plain function — nothing about it is React's business.
 *
 * Restoring the previous value rather than clearing the property matters when
 * two overlays overlap: closing the inner one must not unfreeze the page under
 * the outer one.
 */
function freeze(element) {
    const previous = element.style.overflow;
    element.style.overflow = 'hidden';

    return () => {
        element.style.overflow = previous;
    };
}

/**
 * Freezes the page behind an overlay while `active`.
 *
 * The target is `PageFrame`'s scroller, not the body — see the note at the top
 * of this file for why locking the body does nothing here.
 */
export function useScrollLock(active) {
    const frameRef = useScrollFrame();

    useEffect(() => {
        if (!active) return undefined;
        return freeze(frameRef?.current ?? document.body);
    }, [active, frameRef]);
}

/**
 * Moves focus into `ref` on open, cycles Tab inside it, and hands focus back to
 * whatever opened it on close.
 *
 * The opener is read from `document.activeElement` at open time rather than
 * passed in, so a caller never has to thread a ref to its own trigger — the
 * same trick `MobileMenu` uses.
 *
 * The panel itself is focused first, not its first control. Dropping the
 * keyboard straight onto "Close" reads to a screen reader as though the dialog
 * were already being dismissed; focusing the labelled container announces the
 * dialog instead.
 */
export function useFocusTrap(active, ref, { restoreFocus = true } = {}) {
    const openerRef = useRef(null);

    useEffect(() => {
        if (!active) return undefined;

        openerRef.current = document.activeElement;
        ref.current?.focus({ preventScroll: true });

        const onKeyDown = event => {
            if (event.key !== 'Tab') return;

            const items = focusable(ref.current);
            if (!items.length) {
                /* Nothing to move to, so the panel keeps the keyboard rather
                 * than letting Tab escape to the page underneath. */
                event.preventDefault();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const current = document.activeElement;

            /* `contains` covers focus starting on the panel itself, which is
             * where it was just put — without this the first Tab would leave. */
            if (!ref.current?.contains(current)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
                return;
            }

            if (event.shiftKey && current === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && current === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);

            if (!restoreFocus) return;
            const opener = openerRef.current;
            if (opener instanceof HTMLElement && document.contains(opener)) {
                opener.focus({ preventScroll: true });
            }
        };
    }, [active, ref, restoreFocus]);
}
