import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * A select that is actually part of the design.
 *
 * `<select>` renders its dropdown as an OS-level popup that no stylesheet can
 * reach: on macOS it is a system menu in the system font, on Windows a flat
 * grey list, on Android a full-screen dialog. A template that has agreed a
 * typeface, a radius and a palette loses all three the moment the list opens,
 * which is why nothing in this folder should use one.
 *
 * This is the ARIA combobox/listbox pattern instead, so the behaviour a native
 * select gives you for free is re-implemented rather than dropped:
 *
 *   - `role="combobox"` trigger with `aria-expanded` and `aria-activedescendant`
 *     — focus stays on the trigger and the active option is *pointed at*, which
 *     is what screen readers expect from a collapsed select
 *   - Up/Down/Home/End move, Enter and Space commit, Escape closes, Tab closes
 *     and moves on
 *   - printable characters jump to the next option starting with them, with the
 *     same ~500ms buffer native selects use, so "3 n" still finds "3 nights"
 *   - a hidden input carries the value, so the field still submits with the form
 *
 * Styling is passed in rather than baked: `className` dresses the trigger and
 * `menuClassName` the popover, and `tone` picks the option hover/selected
 * treatment for a dark or light surface. The component only supplies layout and
 * behaviour.
 */

/** How long a type-ahead buffer survives between keystrokes. */
const TYPEAHEAD_MS = 500;

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

/** Accepts `['a', 'b']` or `[{ value, label }]` and normalises to the latter. */
function normalise(options) {
    return options.map(option =>
        typeof option === 'string' ? { value: option, label: option } : option
    );
}

export default function Select({
    options,
    value,
    defaultValue,
    onChange,
    name,
    placeholder = 'Select…',
    tone = 'dark',
    className = '',
    menuClassName = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
}) {
    const items = normalise(options);
    const controlled = value !== undefined;

    const [internal, setInternal] = useState(defaultValue ?? '');
    const selected = controlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);

    const rootRef = useRef(null);
    const listRef = useRef(null);
    const typeahead = useRef({ buffer: '', at: 0 });
    const id = useId();

    const palette = TONES[tone] ?? TONES.dark;
    const selectedItem = items.find(item => item.value === selected);

    const commit = index => {
        const item = items[index];
        if (!item) return;
        if (!controlled) setInternal(item.value);
        onChange?.(item.value);
        setOpen(false);
    };

    const openAt = () => {
        const current = items.findIndex(item => item.value === selected);
        setActiveIdx(current === -1 ? 0 : current);
        setOpen(true);
    };

    /* Dismiss on a click anywhere else. `pointerdown` rather than `click` so the
     * menu is gone before the outside element reacts to its own press. */
    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = event => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    /* Keep the active option in view when the keyboard is driving. */
    useEffect(() => {
        if (!open) return;
        listRef.current
            ?.querySelector(`[data-index="${activeIdx}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [open, activeIdx]);

    const onKeyDown = event => {
        const { key } = event;

        if (key === 'Escape') {
            setOpen(false);
            return;
        }
        if (key === 'Tab') {
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
            setActiveIdx(i => Math.min(i + 1, items.length - 1));
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (key === 'Home') {
            event.preventDefault();
            setActiveIdx(0);
        } else if (key === 'End') {
            event.preventDefault();
            setActiveIdx(items.length - 1);
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            commit(activeIdx);
        } else if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
            /* Type-ahead. The buffer resets after a pause, so a second press of
             * the same letter cycles rather than searching for a doubled one. */
            const now = event.timeStamp;
            const state = typeahead.current;
            state.buffer = now - state.at > TYPEAHEAD_MS ? key : state.buffer + key;
            state.at = now;

            const query = state.buffer.toLowerCase();
            const match = items.findIndex(item => item.label.toLowerCase().startsWith(query));
            if (match !== -1) setActiveIdx(match);
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
                <ChevronDown
                    size={16}
                    className={`shrink-0 opacity-60 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={`${id}-listbox`}
                    role="listbox"
                    aria-label={ariaLabel}
                    className={`ui-scroll absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 m-0 max-h-60 list-none overflow-y-auto rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl ${palette.menu} ${menuClassName}`}
                >
                    {items.map((item, i) => {
                        const isSelected = item.value === selected;
                        return (
                            <li
                                key={item.value}
                                id={`${id}-option-${i}`}
                                role="option"
                                aria-selected={isSelected}
                                data-index={i}
                                onMouseEnter={() => setActiveIdx(i)}
                                /* The trigger keeps focus, so the press must not
                                 * move it — otherwise the menu closes on blur
                                 * before the click lands. */
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => commit(i)}
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                    palette.option
                                } ${i === activeIdx ? palette.active : ''} ${
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
