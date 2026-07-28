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
 * A date field with its own calendar, for the same reason `./Select` exists.
 *
 * `<input type="date">` is the worst offender in the native set: Chrome draws a
 * calendar in the system font with its own accent colour, Safari draws a stepper
 * with no calendar at all, and Firefox draws a third thing. The control also
 * shows `dd/mm/yyyy` placeholder text that cannot be replaced, so a field that
 * should read "Arrival" reads as a form. None of it is styleable.
 *
 * This renders a trigger and a month grid, both ordinary DOM:
 *
 *   - Left/Right move a day, Up/Down a week, PageUp/PageDown a month, Home/End
 *     to the ends of the week — the same map desktop date pickers have used for
 *     twenty years
 *   - Enter commits, Escape closes, Tab closes and moves on
 *   - days before `min` are `aria-disabled` and unreachable, so a booking form
 *     cannot be sent with an arrival in the past
 *   - a hidden input carries an ISO `yyyy-mm-dd` value, so the field submits
 *     exactly what `<input type="date">` would have submitted
 *
 * Month and weekday names come from `Intl`, so the calendar is localised by
 * passing `locale` rather than by shipping a table of strings. `weekStartsOn`
 * defaults to Monday.
 *
 * The date arithmetic, the 42-cell grid and the tone table live in
 * `./calendar.js` — `DateRangePicker` is their second caller.
 */

export default function DateField({
    value,
    defaultValue,
    onChange,
    name,
    placeholder = 'Select a date',
    /** Earliest selectable day. Defaults to today; pass `null` to allow any. */
    min,
    locale,
    weekStartsOn = 1,
    tone = 'dark',
    className = '',
    menuClassName = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}) {
    /* Read the clock once per mount rather than on every render — the same
     * reasoning the folder README applies to `Math.random()`. */
    const [today] = useState(() => startOfDay(new Date()));
    const floor = min === null ? null : (min ?? today);

    const controlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? null);
    const selected = controlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [cursor, setCursor] = useState(() => selected ?? today);
    const [month, setMonth] = useState(() => addMonths(selected ?? today, 0));

    const rootRef = useRef(null);
    const id = useId();

    const palette = CALENDAR_TONES[tone] ?? CALENDAR_TONES.dark;
    const days = buildGrid(month, weekStartsOn);
    const headings = weekdayLabels(locale, weekStartsOn);

    const monthLabel = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
    }).format(month);
    const triggerLabel = selected
        ? new Intl.DateTimeFormat(locale, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }).format(selected)
        : placeholder;

    const disabled = date => floor && date.getTime() < floor.getTime();

    const commit = date => {
        if (disabled(date)) return;
        if (!controlled) setInternal(date);
        onChange?.(date);
        setOpen(false);
    };

    /** Moves the cursor and pages the month with it. */
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
                const start = selected ?? today;
                setCursor(start);
                setMonth(new Date(start.getFullYear(), start.getMonth(), 1));
                setOpen(true);
            }
            return;
        }

        const moves = {
            ArrowLeft: -1,
            ArrowRight: 1,
            ArrowUp: -7,
            ArrowDown: 7,
        };

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

    return (
        <div ref={rootRef} className="relative">
            {name && <input type="hidden" name={name} value={toISO(selected)} readOnly />}

            <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? `${id}-grid` : undefined}
                aria-activedescendant={open ? `${id}-cursor` : undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                onClick={() => setOpen(value_ => !value_)}
                onKeyDown={onKeyDown}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 text-left ${className}`}
            >
                <span className={selected ? '' : palette.muted}>{triggerLabel}</span>
                <CalendarDays size={16} className="shrink-0 opacity-60" />
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label={ariaLabel ?? 'Choose a date'}
                    className={`absolute top-[calc(100%+0.5rem)] left-0 z-50 w-[19rem] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${palette.menu} ${menuClassName}`}
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
                            {monthLabel}
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

                    <div id={`${id}-grid`} className="grid grid-cols-7 gap-1">
                        {headings.map((label, i) => (
                            <span
                                key={`${label}-${i}`}
                                aria-hidden="true"
                                className={`flex h-8 items-center justify-center text-[11px] font-semibold tracking-wider uppercase ${palette.head}`}
                            >
                                {label}
                            </span>
                        ))}

                        {days.map(day => {
                            const outside = day.getMonth() !== month.getMonth();
                            const isDisabled = disabled(day);
                            const isSelected = sameDay(day, selected);
                            const isCursor = sameDay(day, cursor);

                            return (
                                <button
                                    key={day.getTime()}
                                    type="button"
                                    id={isCursor ? `${id}-cursor` : undefined}
                                    /* The trigger owns the keyboard, so days are
                                     * pointer targets only and stay out of the
                                     * tab ring. */
                                    tabIndex={-1}
                                    disabled={isDisabled}
                                    aria-current={sameDay(day, today) ? 'date' : undefined}
                                    aria-pressed={isSelected}
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => commit(day)}
                                    className={[
                                        'flex h-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-sm text-current transition-colors',
                                        isDisabled
                                            ? 'cursor-not-allowed opacity-25'
                                            : palette.day,
                                        outside && !isSelected ? palette.outside : '',
                                        sameDay(day, today) && !isSelected ? palette.today : '',
                                        isCursor && !isSelected ? 'ring-1 ring-current/30' : '',
                                        isSelected ? palette.selected : '',
                                    ].join(' ')}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
