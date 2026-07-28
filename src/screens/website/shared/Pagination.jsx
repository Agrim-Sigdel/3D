import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Page numbers with ellipses.
 *
 * ─── It is a `<nav>` of links-as-buttons, not a list of divs ─────────────────
 *
 * `role="navigation"` with an accessible name, so a screen reader can jump
 * straight to it, and `aria-current="page"` on the active number — which is the
 * only thing that tells a non-visual user where they are. A styled-bold div does
 * not.
 *
 * ─── The window ──────────────────────────────────────────────────────────────
 *
 * `siblings` numbers either side of the current page, always the first and last,
 * ellipses in the gaps. The rule that keeps it from twitching is that the
 * rendered length is **constant**: the boundary cases (page 1, page N) widen the
 * window on the opposite side instead of dropping a slot, so the control does
 * not change width as you page through it and the buttons stay under the cursor.
 *
 * The ellipsis is a `<span aria-hidden>` rather than a disabled button. It is
 * not a control, and announcing "ellipsis, dimmed button" between every pair of
 * numbers is noise.
 *
 * ─── Not infinite scroll ─────────────────────────────────────────────────────
 *
 * Deliberate. `Measured`'s stories and `Asme`'s archive are both sets a reader
 * wants to move around in and link to, and a scroll listener that appends is
 * neither addressable nor reversible.
 */

/** `[1, '…', 4, 5, 6, '…', 20]`, always the same length for a given `siblings`. */
function pages(current, total, siblings) {
    /* first + last + current + 2 ellipses + siblings either side */
    const slots = siblings * 2 + 5;

    if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1);

    const left = Math.max(current - siblings, 1);
    const right = Math.min(current + siblings, total);

    const showLeftGap = left > 2;
    const showRightGap = right < total - 1;

    /* Near an end there is no gap on that side, so the window grows into the
     * space the missing ellipsis would have taken. That is what keeps the
     * length constant. */
    if (!showLeftGap) {
        const run = slots - 2;
        return [...Array.from({ length: run }, (_, i) => i + 1), '…', total];
    }

    if (!showRightGap) {
        const run = slots - 2;
        return [1, '…', ...Array.from({ length: run }, (_, i) => total - run + 1 + i)];
    }

    return [
        1,
        '…',
        ...Array.from({ length: right - left + 1 }, (_, i) => left + i),
        '…',
        total,
    ];
}

export default function Pagination({
    page = 1,
    total = 1,
    onChange,
    siblings = 1,
    showArrows = true,
    label = 'Pagination',
    className = '',
    itemClassName = 'h-9 min-w-9 rounded-full text-sm',
    activeClassName = 'bg-current/10 font-semibold',
    ...rest
}) {
    if (total <= 1) return null;

    const items = pages(page, total, siblings);

    const go = next => {
        const clamped = Math.min(Math.max(next, 1), total);
        if (clamped !== page) onChange?.(clamped);
    };

    const arrow = 'flex items-center justify-center cursor-pointer border-none bg-transparent transition-colors disabled:cursor-default disabled:opacity-25';

    return (
        <nav aria-label={label} className={`flex items-center gap-1 ${className}`} {...rest}>
            {showArrows && (
                <button
                    type="button"
                    onClick={() => go(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className={`${arrow} ${itemClassName}`}
                >
                    <ChevronLeft size={16} />
                </button>
            )}

            {items.map((item, i) =>
                item === '…' ? (
                    <span
                        /* Index-keyed on purpose: the two ellipses are
                         * interchangeable and carry no identity of their own. */
                        key={`gap-${i}`}
                        aria-hidden="true"
                        className={`flex items-center justify-center opacity-40 ${itemClassName}`}
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => go(item)}
                        aria-current={item === page ? 'page' : undefined}
                        aria-label={`Page ${item}`}
                        className={`flex cursor-pointer items-center justify-center border-none bg-transparent tabular-nums transition-colors ${itemClassName} ${
                            item === page ? activeClassName : 'opacity-60 hover:opacity-100'
                        }`}
                    >
                        {item}
                    </button>
                )
            )}

            {showArrows && (
                <button
                    type="button"
                    onClick={() => go(page + 1)}
                    disabled={page === total}
                    aria-label="Next page"
                    className={`${arrow} ${itemClassName}`}
                >
                    <ChevronRight size={16} />
                </button>
            )}
        </nav>
    );
}
