import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * A `Select` you can type into — a destination search, a currency picker.
 *
 * ─── How it differs from `Select`, and why it is not a prop on it ────────────
 *
 * `Select`'s trigger is a `<button>` with `aria-activedescendant`; this one's is
 * an `<input>`. That is not a variant, it is a different control: the input
 * takes the text, the typing filters rather than jumping (`Select`'s type-ahead
 * *moves* to a match, this one *removes* the non-matches), and every keyboard
 * key has a second meaning because the field also has a caret — Home and End
 * belong to the text, not to the list, so the list uses Up/Down only.
 *
 * Merging the two would have meant a component whose ARIA role, keyboard map and
 * DOM all change with a boolean.
 *
 * ─── Filtering ───────────────────────────────────────────────────────────────
 *
 * Case- and diacritic-insensitive: "cote" finds "Côte d'Azur". `normalize('NFD')`
 * plus stripping the combining range is the whole trick, and it is worth having
 * because a destination list is exactly where accented names live and a user
 * typing on a plain keyboard cannot produce them.
 *
 * Substring rather than prefix — "azur" should find it too.
 *
 * ─── Free text ───────────────────────────────────────────────────────────────
 *
 * `allowCustom` lets the typed string be committed when nothing matches, for
 * "anywhere warm". Off by default, because the usual case is a closed set and
 * silently accepting a typo is worse than showing no results.
 */

const TONES = {
    dark: {
        menu: 'border-white/15 bg-[#141d1d]/95 text-white',
        option: 'hover:bg-white/10',
        active: 'bg-white/12',
        muted: 'text-white/50',
    },
    light: {
        menu: 'border-black/10 bg-white/95 text-neutral-900',
        option: 'hover:bg-black/5',
        active: 'bg-black/6',
        muted: 'text-neutral-500',
    },
};

/**
 * Lowercase, diacritics removed. "Côte" → "cote".
 *
 * `NFD` splits an accented character into its base plus a combining mark, and
 * U+0300–U+036F is the block those marks live in. Written as escapes rather than
 * as literal combining characters, which are invisible in an editor and get
 * mangled by anything that re-normalises the source.
 */
const fold = text =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export default function Combobox({
    options = [],
    value,
    defaultValue,
    onChange,
    name,
    placeholder = 'Search…',
    emptyMessage = 'No matches',
    allowCustom = false,
    tone = 'dark',
    className = '',
    inputClassName = '',
    menuClassName = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
}) {
    const items = useMemo(
        () =>
            options.map(option =>
                typeof option === 'string' ? { value: option, label: option } : option
            ),
        [options]
    );

    const controlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const selected = controlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [rawActiveIdx, setActiveIdx] = useState(0);

    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const id = useId();

    const palette = TONES[tone] ?? TONES.dark;
    const selectedLabel = items.find(item => item.value === selected)?.label ?? selected ?? '';

    const filtered = useMemo(() => {
        if (!query) return items;
        const needle = fold(query);
        return items.filter(item => fold(item.label).includes(needle));
    }, [items, query]);

    /*
     * Clamped during render rather than corrected in an effect.
     *
     * The stored index can outrun the list when a filter narrows — eight matches
     * down to three leaves it pointing at 7. Fixing that with `setActiveIdx` in
     * an effect means a render at the stale value, then a second one; deriving
     * it means the wrong value is never rendered at all. Clamping rather than
     * resetting to 0 keeps the highlight near where the user had arrowed to.
     */
    const activeIdx = Math.min(rawActiveIdx, Math.max(filtered.length - 1, 0));

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = event => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
                setQuery('');
            }
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

    const emit = next => {
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    const commit = index => {
        const item = filtered[index];
        if (item) {
            emit(item.value);
        } else if (allowCustom && query.trim()) {
            emit(query.trim());
        } else {
            return;
        }
        setQuery('');
        setOpen(false);
    };

    const clear = () => {
        emit('');
        setQuery('');
        inputRef.current?.focus();
    };

    const onKeyDown = event => {
        const { key } = event;

        if (key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            setQuery('');
            return;
        }
        if (key === 'Tab') {
            setOpen(false);
            return;
        }

        if (!open && (key === 'ArrowDown' || key === 'ArrowUp')) {
            event.preventDefault();
            setOpen(true);
            return;
        }

        if (key === 'ArrowDown') {
            event.preventDefault();
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (key === 'Enter') {
            event.preventDefault();
            commit(activeIdx);
        }
        /* Home and End are deliberately not handled — they belong to the caret. */
    };

    return (
        <div ref={rootRef} className={`relative ${className}`} {...rest}>
            {name && <input type="hidden" name={name} value={selected} readOnly />}

            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    autoComplete="off"
                    aria-expanded={open}
                    aria-controls={`${id}-listbox`}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        open && filtered.length ? `${id}-option-${activeIdx}` : undefined
                    }
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    placeholder={selectedLabel || placeholder}
                    /* The field shows the query while typing and falls back to
                     * the committed label otherwise, so a closed combobox reads
                     * as its value rather than as an empty search box. */
                    value={open ? query : selectedLabel}
                    onChange={event => {
                        setQuery(event.target.value);
                        setActiveIdx(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    className={`w-full border-none bg-transparent outline-none ${inputClassName}`}
                />

                {selected ? (
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Clear selection"
                        className="shrink-0 cursor-pointer border-none bg-transparent p-0 opacity-50 transition-opacity hover:opacity-100"
                    >
                        <X size={15} />
                    </button>
                ) : (
                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`shrink-0 opacity-60 transition-transform duration-200 ${
                            open ? 'rotate-180' : ''
                        }`}
                    />
                )}
            </div>

            {open && (
                <ul
                    ref={listRef}
                    id={`${id}-listbox`}
                    role="listbox"
                    aria-label={ariaLabel}
                    className={`ui-scroll absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 m-0 max-h-60 list-none overflow-y-auto rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl ${palette.menu} ${menuClassName}`}
                >
                    {filtered.length === 0 && (
                        <li className={`px-3 py-2.5 text-sm ${palette.muted}`}>
                            {allowCustom && query.trim()
                                ? `Use “${query.trim()}”`
                                : emptyMessage}
                        </li>
                    )}

                    {filtered.map((item, i) => (
                        <li
                            key={item.value}
                            id={`${id}-option-${i}`}
                            role="option"
                            aria-selected={item.value === selected}
                            data-index={i}
                            onMouseEnter={() => setActiveIdx(i)}
                            onMouseDown={event => event.preventDefault()}
                            onClick={() => commit(i)}
                            className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                palette.option
                            } ${i === activeIdx ? palette.active : ''}`}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
