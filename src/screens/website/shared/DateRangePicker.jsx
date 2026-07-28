import React, { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    CALENDAR_TONES,
    addDays,
    addMonths,
    buildGrid,
    sameDay,
    startOfDay,
    toISO,
    weekdayLabels,
} from './calendar.js';

/**
 * Arrival and departure in one calendar.
 *
 * ─── This gap was shaping content ────────────────────────────────────────────
 *
 * `ROADMAP.md` lists this as *already blocking*, and the evidence is `Aluma`'s
 * enquiry form: it asks for an arrival date plus a "nights" dropdown rather than
 * arrival + departure, **because the range picker did not exist**. A missing
 * component had rewritten the content model, which is the wrong way round.
 *
 * ─── Two months, not one ─────────────────────────────────────────────────────
 *
 * A range that crosses a month boundary — which most stays do — is impossible to
 * see in a single grid: picking the 28th then paging forward loses sight of the
 * start. Both months render side by side above `sm`, and the second collapses
 * away below it where there is no room, which is the one case where paging is
 * the only option.
 *
 * ─── Hover preview ───────────────────────────────────────────────────────────
 *
 * Once the start is chosen, hovering a later day paints the range that *would*
 * be selected. Without it the second click is blind. The preview is driven off
 * `hovered` rather than off the pointer position, so it costs one state change
 * per cell entered rather than one per pointer event.
 *
 * ─── Submitting ──────────────────────────────────────────────────────────────
 *
 * Two hidden inputs, `name` and `${name}End` by default, both ISO `yyyy-mm-dd`
 * in local time. `endName` overrides the second when a backend wants something
 * other than the derived name.
 *
 * @example Wandor — the trip planner
 * <DateRangePicker name="depart" endName="return" tone="light"
 *                  className="…" min={null} />
 */

/** Inclusive `a <= day <= b`, with the endpoints in either order. */
function within(day, a, b) {
    if (!a || !b) return false;
    const lo = Math.min(a.getTime(), b.getTime());
    const hi = Math.max(a.getTime(), b.getTime());
    const t = day.getTime();
    return t > lo && t < hi;
}

export default function DateRangePicker({
    /** `{ start, end }` of `Date | null`. Omit for uncontrolled. */
    value,
    defaultValue,
    onChange,
    name,
    endName,
    placeholder = 'Add dates',
    /** Earliest selectable day. Defaults to today; pass `null` to allow any. */
    min,
    /** Nights, not days. `2` refuses a same-day return. */
    minNights = 1,
    locale,
    weekStartsOn = 1,
    months = 2,
    tone = 'dark',
    className = '',
    menuClassName = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}) {
    const [today] = useState(() => startOfDay(new Date()));
    const floor = min === null ? null : (min ?? today);

    const controlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? { start: null, end: null });
    const range = controlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(() => addMonths(range.start ?? today, 0));
    const [cursor, setCursor] = useState(() => range.start ?? today);
    const [hovered, setHovered] = useState(null);

    const rootRef = useRef(null);
    const id = useId();

    const palette = CALENDAR_TONES[tone] ?? CALENDAR_TONES.dark;
    const headings = weekdayLabels(locale, weekStartsOn);

    /* Choosing the start clears the end, so the next click always completes a
     * range rather than editing an old one. `picking` is derived from that
     * rather than stored — one less state that can disagree with the value. */
    const picking = range.start && !range.end ? 'end' : 'start';

    const disabled = day => {
        if (floor && day.getTime() < floor.getTime()) return true;
        /* While picking the end, everything at or before the start is out. */
        if (picking === 'end' && day.getTime() < addDays(range.start, minNights).getTime()) {
            return true;
        }
        return false;
    };

    const emit = next => {
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    const commit = day => {
        if (disabled(day)) return;

        if (picking === 'start') {
            emit({ start: day, end: null });
            setHovered(null);
            return;
        }

        emit({ start: range.start, end: day });
        setOpen(false);
    };

    const moveCursor = next => {
        setCursor(next);
        if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
            setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
        }
    };

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = event => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    const onKeyDown = event => {
        const { key } = event;

        if (key === 'Escape' || key === 'Tab') {
            setOpen(false);
            return;
        }

        if (!open) {
            if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
                event.preventDefault();
                const start = range.start ?? today;
                setCursor(start);
                setMonth(new Date(start.getFullYear(), start.getMonth(), 1));
                setOpen(true);
            }
            return;
        }

        const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

        if (key in moves) {
            event.preventDefault();
            moveCursor(addDays(cursor, moves[key]));
        } else if (key === 'PageUp') {
            event.preventDefault();
            moveCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, cursor.getDate()));
        } else if (key === 'PageDown') {
            event.preventDefault();
            moveCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()));
        } else if (key === 'Home') {
            event.preventDefault();
            moveCursor(addDays(cursor, -((cursor.getDay() - weekStartsOn + 7) % 7)));
        } else if (key === 'End') {
            event.preventDefault();
            moveCursor(addDays(cursor, 6 - ((cursor.getDay() - weekStartsOn + 7) % 7)));
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            commit(cursor);
        }
    };

    const short = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    const triggerLabel = range.start
        ? range.end
            ? `${short.format(range.start)} — ${short.format(range.end)}`
            : `${short.format(range.start)} — …`
        : placeholder;

    /* The end used for painting: the real one, or whatever is under the pointer
     * while the second click is still pending. */
    const previewEnd = range.end ?? (picking === 'end' ? hovered : null);

    return (
        <div ref={rootRef} className="relative">
            {name && <input type="hidden" name={name} value={toISO(range.start)} readOnly />}
            {name && (
                <input
                    type="hidden"
                    name={endName ?? `${name}End`}
                    value={toISO(range.end)}
                    readOnly
                />
            )}

            <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? `${id}-grid` : undefined}
                aria-activedescendant={open ? `${id}-cursor` : undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                onClick={() => setOpen(state => !state)}
                onKeyDown={onKeyDown}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 text-left ${className}`}
            >
                <span className={range.start ? '' : palette.muted}>{triggerLabel}</span>
                <CalendarDays size={16} className="shrink-0 opacity-60" />
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label={ariaLabel ?? 'Choose dates'}
                    id={`${id}-grid`}
                    className={`absolute top-[calc(100%+0.5rem)] left-0 z-50 w-[19rem] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:w-[38rem] ${palette.menu} ${menuClassName}`}
                    onPointerLeave={() => setHovered(null)}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            aria-label="Previous month"
                            onClick={() => setMonth(addMonths(month, -1))}
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-current transition-colors ${palette.day}`}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span aria-live="polite" className="text-sm font-medium">
                            {picking === 'end' ? 'Select a departure date' : 'Select an arrival date'}
                        </span>

                        <button
                            type="button"
                            aria-label="Next month"
                            onClick={() => setMonth(addMonths(month, 1))}
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-current transition-colors ${palette.day}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex gap-6">
                        {Array.from({ length: months }, (_, offset) => {
                            const shown = addMonths(month, offset);
                            return (
                                <div
                                    key={offset}
                                    /* The trailing months are the ones that go
                                     * when there is no width for them. */
                                    className={offset === 0 ? 'flex-1' : 'hidden flex-1 sm:block'}
                                >
                                    <p className="m-0 mb-2 text-center text-xs font-semibold tracking-wider uppercase opacity-60">
                                        {new Intl.DateTimeFormat(locale, {
                                            month: 'long',
                                            year: 'numeric',
                                        }).format(shown)}
                                    </p>

                                    <div className="grid grid-cols-7 gap-1">
                                        {headings.map((label, i) => (
                                            <span
                                                key={`${label}-${i}`}
                                                aria-hidden="true"
                                                className={`flex h-7 items-center justify-center text-[11px] font-semibold tracking-wider uppercase ${palette.head}`}
                                            >
                                                {label}
                                            </span>
                                        ))}

                                        {buildGrid(shown, weekStartsOn).map(day => {
                                            const outside = day.getMonth() !== shown.getMonth();
                                            const isDisabled = disabled(day);
                                            const isStart = sameDay(day, range.start);
                                            const isEnd = sameDay(day, range.end);
                                            const inRange = within(day, range.start, previewEnd);
                                            const isCursor = sameDay(day, cursor);
                                            const isEdge = isStart || isEnd;

                                            return (
                                                <button
                                                    key={day.getTime()}
                                                    type="button"
                                                    id={isCursor ? `${id}-cursor` : undefined}
                                                    tabIndex={-1}
                                                    disabled={isDisabled}
                                                    aria-current={
                                                        sameDay(day, today) ? 'date' : undefined
                                                    }
                                                    aria-pressed={isEdge}
                                                    onMouseDown={event => event.preventDefault()}
                                                    onPointerEnter={() =>
                                                        !isDisabled && setHovered(day)
                                                    }
                                                    onClick={() => commit(day)}
                                                    className={[
                                                        'flex h-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-sm text-current transition-colors',
                                                        isDisabled
                                                            ? 'cursor-not-allowed opacity-25'
                                                            : palette.day,
                                                        outside && !isEdge ? palette.outside : '',
                                                        inRange && !isEdge ? palette.range : '',
                                                        sameDay(day, today) && !isEdge
                                                            ? palette.today
                                                            : '',
                                                        isCursor && !isEdge
                                                            ? 'ring-1 ring-current/30'
                                                            : '',
                                                        isEdge ? palette.selected : '',
                                                    ].join(' ')}
                                                >
                                                    {day.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {range.start && (
                        <button
                            type="button"
                            onClick={() => {
                                emit({ start: null, end: null });
                                setHovered(null);
                            }}
                            className="mt-3 cursor-pointer border-none bg-transparent p-0 text-xs underline opacity-60 transition-opacity hover:opacity-100"
                        >
                            Clear dates
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
