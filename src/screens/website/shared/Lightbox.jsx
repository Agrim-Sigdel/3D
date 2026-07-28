import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEscape, useFocusTrap, useScrollLock } from './overlay.js';
import { useMotionMs } from './reducedMotion.js';

/**
 * An image enlarged over the page, with the rest of its set reachable.
 *
 * `ROADMAP.md` singles this out: across 25 templates and six gallery sections,
 * **no image could be enlarged.** Every grid in this library was a dead end.
 *
 * ─── Index is owned here, seeded by the caller ───────────────────────────────
 *
 * `index` opens the set at a given item; after that the arrows and the keyboard
 * move it internally and `onIndexChange` reports back. A fully controlled index
 * would make every caller write the same four lines of clamp-and-wrap, and a
 * fully internal one could not open on the thumbnail that was clicked.
 *
 * ─── Only three images are in the DOM ────────────────────────────────────────
 *
 * Current, previous and next. A 40-image gallery would otherwise decode 40
 * full-size files the moment the overlay opens; three keeps the neighbours warm
 * so the arrows are instant without paying for the tail. `loading="eager"` on
 * them for the same reason — these are deliberately prefetched, so the lazy
 * heuristic would be working against the intent.
 *
 * ─── Motion ──────────────────────────────────────────────────────────────────
 *
 * Opacity only. A slide would need the neighbours laid out in a track, and a
 * track of full-bleed images that each fit differently — portrait next to
 * landscape — cannot be positioned without measuring every one. Crossfade needs
 * no measurement and does not care about aspect ratio.
 *
 * @example Vortx — an octagonal grid that now opens
 * <Lightbox items={SHOTS} index={openAt} onClose={() => setOpenAt(null)} />
 * // items: [{ src, alt, caption? }]
 */
export default function Lightbox({
    items = [],
    /** Item to open on. `null` or `-1` keeps the overlay closed. */
    index = null,
    onIndexChange,
    onClose,
    loop = true,
    showCounter = true,
    duration = 300,
    className = '',
    scrimClassName = 'bg-black/95',
    /**
     * `(item, index) => ReactNode`, replacing the `<img>` for that slide.
     *
     * The escape hatch for a gallery whose tiles are not photographs — `Marlowe`
     * draws its cloth in CSS and has no image to enlarge, so it enlarges the
     * drawing instead. Everything around the slide (scrim, arrows, counter,
     * caption, focus and scroll handling) is unaffected.
     */
    renderItem,
    ...rest
}) {
    const open = index !== null && index >= 0 && index < items.length;

    const panelRef = useRef(null);
    const ms = useMotionMs(duration);

    /*
     * `shown` mirrors `index` but survives it going null, so the overlay can
     * fade out still showing the image it was showing. Reading `items[index]`
     * directly would blank the frame the instant the caller cleared its state
     * and the exit would fade out nothing.
     *
     * The sync is done **during render**, not in an effect. React's documented
     * "adjusting state when a prop changes" pattern: compare against the last
     * prop value, and if it moved, set. React re-runs the component immediately
     * without committing the intermediate render, so nothing is ever painted at
     * the stale value — where an effect would paint the old image for a frame
     * every time the caller opened a different one.
     */
    const [shown, setShown] = useState(index ?? 0);
    const [lastIndex, setLastIndex] = useState(index);

    if (index !== lastIndex) {
        setLastIndex(index);
        if (open) setShown(index);
    }

    const go = useCallback(
        step => {
            const count = items.length;
            if (!count) return;

            const next = shown + step;
            const wrapped = loop
                ? (next + count) % count
                : Math.min(Math.max(next, 0), count - 1);

            if (wrapped === shown) return;
            setShown(wrapped);
            onIndexChange?.(wrapped);
        },
        [items.length, shown, loop, onIndexChange]
    );

    useEscape(open, onClose);
    useScrollLock(open);
    useFocusTrap(open, panelRef);

    /* Arrows are bound at the document rather than on the panel: focus sits on
     * the panel container after `useFocusTrap`, and a `keydown` there would stop
     * working the moment the user tabbed onto the close button. */
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = event => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                go(1);
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                go(-1);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, go]);

    const count = items.length;
    const atStart = !loop && shown === 0;
    const atEnd = !loop && shown === count - 1;

    /* Current plus its two neighbours, deduplicated so a one- or two-item set
     * does not render the same node twice. */
    const warm = count
        ? [...new Set([shown, (shown + 1) % count, (shown - 1 + count) % count])]
        : [];

    return (
        <div
            role="presentation"
            onClick={event => {
                if (event.target === event.currentTarget) onClose?.();
            }}
            className={`fixed inset-0 z-50 flex flex-col ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
            } ${scrimClassName} ${className}`}
            style={{
                transitionProperty: 'opacity',
                transitionDuration: `${ms}ms`,
            }}
            inert={!open}
            {...rest}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={items[shown]?.alt ?? 'Image viewer'}
                tabIndex={-1}
                className="relative flex flex-1 flex-col outline-none"
            >
                <div className="flex shrink-0 items-center justify-between p-4 sm:p-6">
                    {showCounter && count > 1 ? (
                        <span
                            className="font-mono text-xs tracking-widest text-white/60 tabular-nums"
                            aria-live="polite"
                        >
                            {String(shown + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                        </span>
                    ) : (
                        <span />
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close viewer"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white hover:text-black"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div
                    role="presentation"
                    onClick={event => {
                        if (event.target === event.currentTarget) onClose?.();
                    }}
                    className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16"
                >
                    {warm.map(i => (
                        <div
                            key={items[i].src ?? i}
                            aria-hidden={i !== shown}
                            className="absolute flex max-h-full max-w-full items-center justify-center"
                            style={{
                                opacity: i === shown ? 1 : 0,
                                transitionProperty: 'opacity',
                                transitionDuration: `${ms}ms`,
                                /* Keeps the warm neighbours from swallowing the
                                 * scrim clicks that close the overlay. */
                                pointerEvents: i === shown ? undefined : 'none',
                            }}
                        >
                            {renderItem ? (
                                renderItem(items[i], i)
                            ) : (
                                <img
                                    src={items[i].src}
                                    alt={items[i].alt ?? ''}
                                    loading="eager"
                                    decoding="async"
                                    className="max-h-full max-w-full object-contain"
                                />
                            )}
                        </div>
                    ))}

                    {count > 1 && (
                        <>
                            <Arrow
                                side="left"
                                disabled={atStart}
                                onClick={() => go(-1)}
                                label="Previous image"
                            />
                            <Arrow
                                side="right"
                                disabled={atEnd}
                                onClick={() => go(1)}
                                label="Next image"
                            />
                        </>
                    )}
                </div>

                <div className="flex min-h-16 shrink-0 items-start justify-center p-4 sm:p-6">
                    {items[shown]?.caption && (
                        <p className="m-0 max-w-2xl text-center text-sm leading-relaxed text-white/70">
                            {items[shown].caption}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Arrow({ side, disabled, onClick, label }) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={`absolute ${
                side === 'left' ? 'left-1 sm:left-4' : 'right-1 sm:right-4'
            } flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white hover:text-black disabled:cursor-default disabled:opacity-25 disabled:hover:bg-white/10 disabled:hover:text-white`}
        >
            <Icon size={22} />
        </button>
    );
}
