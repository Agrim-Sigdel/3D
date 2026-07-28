import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Clock } from 'lucide-react';

/**
 * A time of day, chosen from a list of slots.
 *
 * ─── Slots, not a clock ──────────────────────────────────────────────────────
 *
 * `<input type="time">` is the same OS-drawn control the rest of this folder
 * refuses, and rebuilding it faithfully means an hour spinner, a minute spinner,
 * an AM/PM segment, and locale-dependent segment *order*. None of that is what
 * the pages here actually ask for. Every real use in this library is booking
 * something against a schedule — `Lithos`'s live tour departs at fixed times,
 * not at 14:37 — so the control is a listbox over generated slots.
 *
 * That makes it structurally `Select`, and it deliberately behaves like one:
 * same keyboard map, same `aria-activedescendant` pattern, same hidden input.
 * What it adds is generating the options from `start`/`end`/`interval`, and
 * formatting them through `Intl` so 24- versus 12-hour display follows the
 * locale rather than a prop.
 *
 * ─── The value is a 24-hour `HH:mm` string ───────────────────────────────────
 *
 * Not a `Date`. A time with no date attached is not a moment, and making one by
 * pinning it to "today" produces a value that is wrong tomorrow and shifts
 * across a DST boundary. `HH:mm` is what `<input type="time">` submits, so the
 * hidden input is a drop-in.
 *
 * @example Lithos — departure times for the live tour
 * <TimeField name="departure" start="09:00" end="16:00" interval={90} tone="dark" />
 */

const TONES = {
    dark: {
        menu: 'border-white/15 bg-[#141d1d]/95 text-white',
        option: 'hover:bg-white/10',
        active: 'bg-white/12',
        selected: 'text-white',
        muted: 'text-white/50',
    },
    light: {
        menu: 'border-black/10 bg-white/95 text-neutral-900',
        option: 'hover:bg-black/5',
        active: 'bg-black/6',
        selected: 'text-neutral-900',
        muted: 'text-neutral-500',
    },
};

const toMinutes = hhmm => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const toHHMM = minutes =>
    `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Slots from `start` to `end` inclusive, every `interval` minutes.
 *
 * Formatted through a fixed 1970 date rather than today's: `Intl` only reads the
 * time components, and a constant date keeps the output stable across a DST
 * change that would otherwise shift every label by an hour for one day a year.
 */
function buildSlots(start, end, interval, locale) {
    const format = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' });
    const from = toMinutes(start);
    const to = toMinutes(end);

    const slots = [];
    for (let m = from; m <= to; m += interval) {
        const value = toHHMM(m);
        slots.push({
            value,
            label: format.format(new Date(1970, 0, 1, Math.floor(m / 60), m % 60)),
        });
    }
    return slots;
}

export default function TimeField({
    value,
    defaultValue,
    onChange,
    name,
    start = '09:00',
    end = '17:00',
    /** Minutes between slots. */
    interval = 30,
    /** Overrides the generated slots entirely. `[{ value, label }]` or `['09:00']`. */
    options,
    placeholder = 'Select a time',
    /** `HH:mm` before which slots are unselectable — a same-day cutoff. */
    min,
    locale,
    tone = 'dark',
    className = '',
    menuClassName = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}) {
    const items = options
        ? options.map(option =>
              typeof option === 'string' ? { value: option, label: option } : option
          )
        : buildSlots(start, end, interval, locale);

    const controlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const selected = controlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);

    const rootRef = useRef(null);
    const listRef = useRef(null);
    const id = useId();

    const palette = TONES[tone] ?? TONES.dark;
    const selectedItem = items.find(item => item.value === selected);
    const floor = min ? toMinutes(min) : null;

    const isDisabled = item => floor !== null && toMinutes(item.value) < floor;

    const commit = index => {
        const item = items[index];
        if (!item || isDisabled(item)) return;
        if (!controlled) setInternal(item.value);
        onChange?.(item.value);
        setOpen(false);
    };

    const openAt = () => {
        const current = items.findIndex(item => item.value === selected);
        /* Opens on the first *selectable* slot when nothing is chosen, so the
         * keyboard does not start on a greyed-out row. */
        const fallback = items.findIndex(item => !isDisabled(item));
        setActiveIdx(current === -1 ? Math.max(fallback, 0) : current);
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = event => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        listRef.current
            ?.querySelector(`[data-index="${activeIdx}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [open, activeIdx]);

    /** Skips disabled slots so the arrows never park on one. */
    const step = direction => {
        setActiveIdx(current => {
            let next = current + direction;
            while (next >= 0 && next < items.length && isDisabled(items[next])) {
                next += direction;
            }
            return next >= 0 && next < items.length ? next : current;
        });
    };

    const onKeyDown = event => {
        const { key } = event;

        if (key === 'Escape' || key === 'Tab') {
            setOpen(false);
            return;
        }

        if (!open) {
            if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
                event.preventDefault();
                openAt();
            }
            return;
        }

        if (key === 'ArrowDown') {
            event.preventDefault();
            step(1);
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            step(-1);
        } else if (key === 'Home') {
            event.preventDefault();
            setActiveIdx(Math.max(items.findIndex(item => !isDisabled(item)), 0));
        } else if (key === 'End') {
            event.preventDefault();
            setActiveIdx(items.length - 1);
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            commit(activeIdx);
        }
    };

    return (
        <div ref={rootRef} className="relative">
            {name && <input type="hidden" name={name} value={selected} readOnly />}

            <button
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={`${id}-listbox`}
                aria-activedescendant={open ? `${id}-option-${activeIdx}` : undefined}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                onClick={() => (open ? setOpen(false) : openAt())}
                onKeyDown={onKeyDown}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 text-left ${className}`}
            >
                <span className={selectedItem ? '' : palette.muted}>
                    {selectedItem?.label ?? placeholder}
                </span>
                <Clock size={16} className="shrink-0 opacity-60" />
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={`${id}-listbox`}
                    role="listbox"
                    aria-label={ariaLabel ?? 'Available times'}
                    className={`ui-scroll absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 m-0 max-h-60 list-none overflow-y-auto rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl ${palette.menu} ${menuClassName}`}
                >
                    {items.map((item, i) => {
                        const isSelected = item.value === selected;
                        const unavailable = isDisabled(item);

                        return (
                            <li
                                key={item.value}
                                id={`${id}-option-${i}`}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={unavailable || undefined}
                                data-index={i}
                                onMouseEnter={() => !unavailable && setActiveIdx(i)}
                                /* Keeps focus on the trigger — without this the
                                 * press blurs it, the blur closes the menu, and
                                 * the click lands on nothing. */
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => commit(i)}
                                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                    unavailable
                                        ? 'cursor-not-allowed opacity-30'
                                        : `cursor-pointer ${palette.option}`
                                } ${i === activeIdx && !unavailable ? palette.active : ''} ${
                                    isSelected ? palette.selected : palette.muted
                                }`}
                            >
                                {item.label}
                                {isSelected && <Check size={14} className="shrink-0" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
