/**
 * Date arithmetic and grid building, shared by `DateField` and
 * `DateRangePicker`.
 *
 * These were `DateField`'s private helpers until the range picker needed the
 * same six-week grid, the same ISO serialisation and the same `Intl` labels.
 * Extracted rather than copied, under the folder's rule about the second use.
 *
 * A `.js` module, not `.jsx`: nothing here renders, and keeping it out of a
 * component file leaves that file fast-refreshable.
 *
 * ─── Everything is local time ────────────────────────────────────────────────
 *
 * Every helper builds dates through `new Date(y, m, d)` and compares them at
 * midnight local. The trap this avoids is `toISOString()`, which converts to UTC
 * first — west of Greenwich that reports yesterday's date for anything in the
 * evening, so a booking form silently submits the wrong day. `toISO` below
 * formats the local components by hand for that reason.
 */

/** Midnight local on the same calendar day. The comparison basis throughout. */
export function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/** Always lands on the 1st — this is for paging a calendar, not for arithmetic. */
export function addMonths(date, n) {
    return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function sameDay(a, b) {
    return Boolean(a) && Boolean(b) && a.getTime() === b.getTime();
}

/** `yyyy-mm-dd` in local time. See the note above about `toISOString()`. */
export function toISO(date) {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * The six-week grid for `month`, always 42 cells so the popover never changes
 * height as you page through — a calendar that resizes under the cursor is the
 * single most irritating thing a date picker can do.
 */
export function buildGrid(month, weekStartsOn) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const lead = (first.getDay() - weekStartsOn + 7) % 7;
    const start = addDays(first, -lead);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekdayLabels(locale, weekStartsOn) {
    const format = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    /* 2024-01-07 was a Sunday, so this walks a known week. */
    const sunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) =>
        format.format(addDays(sunday, (i + weekStartsOn) % 7)).slice(0, 2)
    );
}

/**
 * Dark and light treatments for a calendar popover.
 *
 * Shared so a page carrying both a single date and a range does not have two
 * calendars that disagree about what "selected" looks like. `range` and its
 * endpoints are only read by `DateRangePicker`.
 */
export const CALENDAR_TONES = {
    dark: {
        menu: 'border-white/15 bg-[#141d1d]/95 text-white',
        muted: 'text-white/45',
        head: 'text-white/40',
        day: 'hover:bg-white/10',
        outside: 'text-white/25',
        today: 'ring-1 ring-white/35',
        selected: 'bg-white font-semibold text-[#141d1d]',
        range: 'bg-white/15',
    },
    light: {
        menu: 'border-black/10 bg-white/95 text-neutral-900',
        muted: 'text-neutral-400',
        head: 'text-neutral-400',
        day: 'hover:bg-black/5',
        outside: 'text-neutral-300',
        today: 'ring-1 ring-neutral-400',
        selected: 'bg-neutral-900 font-semibold text-white',
        range: 'bg-neutral-900/10',
    },
};
