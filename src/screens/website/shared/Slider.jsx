import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A value picked along a track.
 *
 * ─── Why not `<input type="range">` ─────────────────────────────────────────
 *
 * It is the same defect as `<select>`, and `ROADMAP.md` says so explicitly. The
 * track and the thumb are OS-drawn pseudo-elements reached only through
 * `::-webkit-slider-thumb` and `::-moz-range-thumb` — different names, different
 * box models, and no way at all to draw anything *between* the track's start and
 * the thumb without a second stacked element. Firefox and WebKit disagree about
 * whether the thumb's height grows the track. A design that specifies a 2px rail
 * with an 18px dot cannot be expressed.
 *
 * `role="slider"` on a div is the ARIA pattern, and the keyboard map is the part
 * that must not be lost: arrows by `step`, PageUp/PageDown by `bigStep`,
 * Home/End to the ends.
 *
 * ─── Pointer handling ────────────────────────────────────────────────────────
 *
 * `setPointerCapture` on the thumb, so a drag that leaves the element vertically
 * keeps tracking — without it the value freezes the moment the pointer strays
 * off the 18px dot, which is most of any real drag.
 *
 * The value is rounded to the step and clamped in one place (`quantise`), and
 * `onChange` fires only when the quantised value actually changes. A pointermove
 * at 120Hz over a ten-step slider would otherwise re-render on every event to
 * produce the same number.
 *
 * ─── Formatting ──────────────────────────────────────────────────────────────
 *
 * `format` is used for `aria-valuetext`, not just for display. A slider whose
 * numbers are minutes announces "45" without it, where the useful thing to hear
 * is "45 minutes".
 */

/** Snaps to the nearest step and clamps, in that order. */
function quantise(raw, min, max, step) {
    const stepped = Math.round((raw - min) / step) * step + min;
    const clamped = Math.min(Math.max(stepped, min), max);
    /* Floating-point steps (0.1) accumulate error through the divide-multiply.
     * Rounding to the step's own precision keeps 0.30000000000000004 out. */
    const decimals = (String(step).split('.')[1] ?? '').length;
    return Number(clamped.toFixed(decimals));
}

export default function Slider({
    value,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    bigStep = step * 10,
    name,
    disabled = false,
    format,
    className = '',
    trackClassName = 'h-0.5 bg-current/20',
    rangeClassName = 'bg-current',
    thumbClassName = 'h-4 w-4 bg-current',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
}) {
    const [internal, setInternal] = useState(defaultValue ?? min);
    const controlled = value !== undefined;
    const current = controlled ? value : internal;

    const trackRef = useRef(null);

    /* State, not a ref. The move/up listeners are attached by an effect keyed on
     * this, and a ref would not re-run it — a press that lands exactly on the
     * current value commits nothing, re-renders nothing, and would leave the
     * drag with no listeners at all. */
    const [dragging, setDragging] = useState(false);

    const commit = useCallback(
        next => {
            const quantised = quantise(next, min, max, step);
            if (quantised === current) return;
            if (!controlled) setInternal(quantised);
            onChange?.(quantised);
        },
        [current, controlled, onChange, min, max, step]
    );

    /** Maps a clientX onto the track's range. */
    const fromPointer = useCallback(
        clientX => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect || !rect.width) return null;
            const ratio = (clientX - rect.left) / rect.width;
            return min + ratio * (max - min);
        },
        [min, max]
    );

    useEffect(() => {
        if (!dragging) return undefined;

        const onMove = event => {
            const next = fromPointer(event.clientX);
            if (next !== null) commit(next);
        };
        const onUp = () => setDragging(false);

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [dragging, fromPointer, commit]);

    const onKeyDown = event => {
        if (disabled) return;

        const moves = {
            ArrowRight: step,
            ArrowUp: step,
            ArrowLeft: -step,
            ArrowDown: -step,
            PageUp: bigStep,
            PageDown: -bigStep,
        };

        if (event.key === 'Home') {
            event.preventDefault();
            commit(min);
        } else if (event.key === 'End') {
            event.preventDefault();
            commit(max);
        } else if (moves[event.key] !== undefined) {
            event.preventDefault();
            commit(current + moves[event.key]);
        }
    };

    const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
    const text = format ? format(current) : undefined;

    return (
        <div
            className={`relative flex h-5 w-full items-center ${
                disabled ? 'opacity-40' : 'cursor-pointer'
            } ${className}`}
            onPointerDown={event => {
                if (disabled) return;
                /* A press anywhere on the track jumps there and starts a drag,
                 * which is what a native range does. */
                setDragging(true);
                event.currentTarget.querySelector('[role="slider"]')?.focus();
                const next = fromPointer(event.clientX);
                if (next !== null) commit(next);
            }}
            {...rest}
        >
            {name && <input type="hidden" name={name} value={current} readOnly />}

            <div ref={trackRef} className={`w-full overflow-hidden rounded-full ${trackClassName}`}>
                <div
                    className={`h-full rounded-full ${rangeClassName}`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={current}
                aria-valuetext={text}
                aria-disabled={disabled || undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                onKeyDown={onKeyDown}
                onPointerDown={event => {
                    if (disabled) return;
                    event.stopPropagation();
                    setDragging(true);
                    /* Capture, so a drag that wanders off the 16px thumb keeps
                     * reporting. Without it the value sticks mid-gesture. */
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                }}
                className={`absolute rounded-full outline-offset-4 ${thumbClassName}`}
                style={{
                    left: `${percent}%`,
                    transform: 'translateX(-50%)',
                    touchAction: 'none',
                }}
            />
        </div>
    );
}
