import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useReducedMotion } from './reducedMotion.js';
import { useScrollFrame } from './frameContext.js';

/**
 * The mobile nav panel, written eight times in this folder before this file.
 *
 * `Adam` · `Verde` · `Measured` · `Axion` · `Outbox` · `Skyline` · `Basilico` ·
 * `Aluma` each grew their own, and they are not eight copies of one thing —
 * they are three different mechanisms that happen to share a job. Picking a
 * winner would have broken five templates, so all three ship behind `variant`:
 *
 *   overlay   A full-viewport surface that *covers* the page. Either fades in
 *             place (`from="fade"`, Adam/Verde) or slides in off an edge
 *             (`from="top"`, Outbox). Content underneath does not move.
 *
 *   collapse  An in-flow `grid-rows-[0fr] → [1fr]` box that *pushes* the page
 *             down (Skyline/Basilico/Aluma). The grid trick animates to the
 *             content's natural height without measuring it, which is why it
 *             is worth the odd markup — no `scrollHeight` read, no resize
 *             observer, no wrong height when a font lands late.
 *
 *   sheet     A panel docked to one edge over a scrim (Axion). The scrim and
 *             the panel animate on separate properties, so the backdrop can
 *             fade while the panel travels.
 *
 * They fail differently, which is the real reason to keep all three: `collapse`
 * reflows everything below it and cannot cover a hero; `overlay` covers but
 * leaves the page scrolled where it was; `sheet` needs somewhere to dock and
 * looks wrong at desktop widths. The choice is a layout decision, not a taste
 * one.
 *
 * ─── What this adds over the eight originals ─────────────────────────────────
 *
 * `Escape` closes, focus moves into the panel on open and returns to whatever
 * opened it on close, and the page behind an `overlay` or `sheet` stops
 * scrolling while the menu is up. None of the eight did all four.
 *
 * The scroll lock is the one worth calling out. `Measured` locks
 * `document.body`, which does nothing here — every template in this folder is
 * a `position: fixed` page that scrolls *inside* `PageFrame`, so the body has
 * no scroll to lock. This locks the frame from `useScrollFrame()` instead, and
 * falls back to the body only when there is no frame.
 *
 * Closed panels are marked `inert`, which fixes a bug all three `collapse`
 * templates share: `grid-rows-[0fr]` plus `overflow-hidden` hides the links
 * visually but leaves them in the tab order, so keyboard users tab into a menu
 * they cannot see.
 *
 * ─── Motion ──────────────────────────────────────────────────────────────────
 *
 * Every variant is CSS transitions, not Framer. `Outbox` used `AnimatePresence`
 * for its slide; the same movement is one `translate` and costs no animation
 * loop, which matters on a page already running a dozen of them. Timing is
 * inline rather than `duration-300` utilities so `duration` stays a prop and
 * so reduced motion can zero it — see `reducedMotion.js`. Under reduced motion
 * the menu still opens, it just arrives instead of travelling.
 *
 * ─── Content ─────────────────────────────────────────────────────────────────
 *
 * Children, not an `items` array. The eight originals hold links, a CTA
 * button, a clock, a rule and a newsletter block between them, and no prop
 * shape covers that without becoming a second templating language. For the
 * staggered entrance that `Adam` and `Measured` do by hand, wrap each row in
 * `<MobileMenu.Item index={i}>`.
 *
 * @example Aluma / Skyline / Basilico — in-flow collapse under a sticky nav
 * <MobileMenu variant="collapse" open={open} className="md:hidden">
 *     <div className="flex flex-col gap-1 pt-4">
 *         {links.map(l => <a key={l.href} href={l.href} onClick={close}>{l.label}</a>)}
 *     </div>
 * </MobileMenu>
 *
 * @example Adam — full-screen fade with staggered links
 * <MobileMenu variant="overlay" from="fade" open={open} onClose={close}
 *             panelClassName="bg-black/95 backdrop-blur-md"
 *             stagger={60} staggerDelay={100}>
 *     {items.map((item, i) => (
 *         <MobileMenu.Item key={item} index={i}>{item}</MobileMenu.Item>
 *     ))}
 * </MobileMenu>
 *
 * `staggerDelay` holds the rows back until the surface they sit on has
 * arrived — `Adam` waits 100ms for the fade before the first link moves.
 */

/**
 * Timing and open-state for `MobileMenu.Item`.
 *
 * Not exported: an `Item` outside a `MobileMenu` gets the defaults and renders
 * as a plain wrapper rather than throwing, and keeping the context private
 * leaves this file exporting only components, which is what fast refresh wants.
 */
const MenuContext = createContext(null);

const DEFAULT_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Where an `overlay` or `sheet` travels from. `fade` does not travel at all. */
const OFFSETS = {
    fade: null,
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)',
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
};

/** Which edge a `sheet` docks to, given the side it slides in from. */
const SHEET_ANCHOR = {
    top: 'justify-start',
    bottom: 'justify-end',
    left: 'justify-start items-stretch flex-row',
    right: 'justify-end items-stretch flex-row',
};

export default function MobileMenu({
    variant = 'overlay',
    open = false,
    onClose,
    from = variant === 'sheet' ? 'bottom' : 'fade',
    duration = 400,
    ease = DEFAULT_EASE,
    stagger = 0,
    staggerDelay = 0,
    /* `sheet` only. Its scrim and its panel are doing different jobs — a fade
     * and a travel — and `Axion` eases them differently for that reason. */
    scrimEase = ease,
    closeOnEscape = true,
    lockScroll = variant !== 'collapse',
    restoreFocus = true,
    className = '',
    panelClassName = '',
    scrimClassName = '',
    children,
    ...rest
}) {
    const reduced = useReducedMotion();
    const frameRef = useScrollFrame();
    const panelRef = useRef(null);
    const openerRef = useRef(null);

    const ms = reduced ? 0 : duration;

    /* Escape is handled at the document, not on the panel, because the trigger
     * that opened the menu usually keeps focus in the `collapse` variant — a
     * listener on the panel would never see the key. */
    useEffect(() => {
        if (!open || !closeOnEscape || !onClose) return undefined;

        const onKeyDown = event => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, closeOnEscape, onClose]);

    /* The page behind a covering menu must not scroll. The element to freeze is
     * PageFrame's scroller, not the body — see the note above. */
    useEffect(() => {
        if (!open || !lockScroll) return undefined;

        const target = frameRef?.current ?? document.body;
        const previous = target.style.overflow;
        target.style.overflow = 'hidden';

        return () => {
            target.style.overflow = previous;
        };
    }, [open, lockScroll, frameRef]);

    /* Focus follows the panel open and comes back on close. Reading
     * `activeElement` at open time is what makes the return trip work without
     * the caller passing a ref to its own trigger. */
    useEffect(() => {
        if (!open) return undefined;

        openerRef.current = document.activeElement;
        panelRef.current?.focus({ preventScroll: true });

        return () => {
            if (!restoreFocus) return;
            const opener = openerRef.current;
            if (opener instanceof HTMLElement && document.contains(opener)) {
                opener.focus({ preventScroll: true });
            }
        };
    }, [open, restoreFocus]);

    /* `staggerDelay` is zeroed here rather than in `Item`, so reduced motion is
     * decided once and the rows only ever read numbers. */
    const context = { open, stagger, staggerDelay: reduced ? 0 : staggerDelay, duration: ms, ease };

    /* ---------------------------------------------------------------- collapse
     * `grid-template-rows` is the animated property and `min-h-0` on the inner
     * div is load-bearing: without it the row refuses to shrink below its
     * content and the box never closes. */
    if (variant === 'collapse') {
        return (
            <MenuContext.Provider value={context}>
                <div
                    className={`grid overflow-hidden ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    } ${className}`}
                    style={{
                        transitionProperty: 'grid-template-rows, opacity',
                        transitionDuration: `${ms}ms`,
                        transitionTimingFunction: ease,
                        opacity: open ? 1 : 0,
                    }}
                    inert={!open}
                    {...rest}
                >
                    <div className="min-h-0">
                        <div
                            ref={panelRef}
                            tabIndex={-1}
                            className={`outline-none ${panelClassName}`}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </MenuContext.Provider>
        );
    }

    const offset = OFFSETS[from] ?? null;
    const sliding = offset !== null;

    /* A sliding panel needs its container opaque to hit-testing from the first
     * frame, so the root cannot fade — visibility is carried by `inert` and
     * `pointer-events` instead. A fading one has nothing to slide, so the root
     * carries the opacity and the panel is inert markup. */
    const rootStyle = sliding
        ? undefined
        : {
              opacity: open ? 1 : 0,
              transitionProperty: 'opacity',
              transitionDuration: `${ms}ms`,
              transitionTimingFunction: ease,
          };

    const panelStyle = sliding
        ? {
              transform: open ? 'none' : offset,
              transitionProperty: 'transform',
              transitionDuration: `${ms}ms`,
              transitionTimingFunction: ease,
          }
        : undefined;

    /* ------------------------------------------------------------------- sheet
     * Two moving parts on separate properties: the scrim fades, the panel
     * travels. Clicking the scrim closes, which is the affordance every sheet
     * is expected to have and the reason it is a real element rather than a
     * `::before`. */
    if (variant === 'sheet') {
        return (
            <MenuContext.Provider value={context}>
                <div
                    className={`fixed inset-0 z-50 flex flex-col ${
                        SHEET_ANCHOR[from] ?? SHEET_ANCHOR.bottom
                    } ${open ? 'pointer-events-auto' : 'pointer-events-none'} ${className}`}
                    inert={!open}
                    {...rest}
                >
                    <div
                        onClick={onClose}
                        className={`absolute inset-0 bg-black/60 ${scrimClassName}`}
                        style={{
                            opacity: open ? 1 : 0,
                            transitionProperty: 'opacity',
                            transitionDuration: `${ms}ms`,
                            transitionTimingFunction: scrimEase,
                        }}
                    />

                    <div
                        ref={panelRef}
                        tabIndex={-1}
                        className={`relative outline-none ${panelClassName}`}
                        style={panelStyle}
                    >
                        {children}
                    </div>
                </div>
            </MenuContext.Provider>
        );
    }

    /* ----------------------------------------------------------------- overlay */
    return (
        <MenuContext.Provider value={context}>
            <div
                className={`fixed inset-0 z-50 flex flex-col ${
                    open ? 'pointer-events-auto' : 'pointer-events-none'
                } ${className}`}
                style={rootStyle}
                inert={!open}
                {...rest}
            >
                <div
                    ref={panelRef}
                    tabIndex={-1}
                    className={`flex flex-1 flex-col outline-none ${panelClassName}`}
                    style={panelStyle}
                >
                    {children}
                </div>
            </div>
        </MenuContext.Provider>
    );
}

/**
 * One staggered row inside a `MobileMenu`.
 *
 * `index` drives the delay rather than the child's position in the tree,
 * because the templates that stagger do not put every row in one container —
 * `Verde` has links in one block and a CTA in another, and both need to keep
 * counting. Passing the number explicitly is the only version that survives
 * that without the component guessing at its own children.
 *
 * Rows travel up and fade; under reduced motion the delay and the duration are
 * already zero from the parent, so they simply appear.
 */
function MobileMenuItem({ index = 0, as: Tag = 'div', className = '', style, children, ...rest }) {
    const context = useContext(MenuContext);
    const open = context?.open ?? true;
    const stagger = context?.stagger ?? 0;
    const staggerDelay = context?.staggerDelay ?? 0;
    const duration = context?.duration ?? 0;
    const ease = context?.ease ?? DEFAULT_EASE;

    /* No delay on the way out. Staggering a close makes the menu feel like it
     * is refusing to leave, and the eight originals that stagger all do it on
     * entry only. */
    const delay = open ? staggerDelay + index * stagger : 0;

    return (
        <Tag
            className={className}
            style={{
                opacity: open ? 1 : 0,
                transform: open ? 'none' : 'translateY(24px)',
                transitionProperty: 'opacity, transform',
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: ease,
                ...style,
            }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

MobileMenu.Item = MobileMenuItem;
