import React, { createContext, useContext, useId, useRef, useState } from 'react';

/**
 * A radio group — a plan picker, a delivery option.
 *
 * ─── The group is the component, not the button ──────────────────────────────
 *
 * Native radios are grouped by sharing a `name`, and the browser supplies the
 * arrow-key behaviour off that. Rebuild the control and the grouping has to be
 * rebuilt too, which is why this exports a `RadioGroup` with `RadioGroup.Option`
 * children rather than a standalone `Radio`: a lone radio has no meaning.
 *
 * What the group owns, all of it behaviour a native group already had:
 *
 *   - **Roving tabindex.** One stop for the whole group. Tab moves past it; the
 *     arrows move within. If nothing is selected yet the *first* option is the
 *     tab stop, so the group is always reachable.
 *   - Arrows wrap in both directions and **select as they move**, which is what
 *     native radios do — there is no "focused but unselected" state in a radio
 *     group the way there is in a tablist set to manual.
 *   - Home/End, and Space to select the focused option.
 *
 * ─── Cards, not dots ─────────────────────────────────────────────────────────
 *
 * `Option`'s children may be a function of `{ checked }`, so a whole pricing
 * card can be the radio rather than a dot beside one. That is the case this was
 * built for — `Mindful`'s plans are three cards where the entire card is the
 * hit area, and a dot-plus-label component could not express it.
 */

const RadioContext = createContext(null);

export default function RadioGroup({
    value,
    defaultValue,
    onChange,
    name,
    /** `vertical` swaps which arrow pair is primary. Both pairs always work. */
    orientation = 'vertical',
    disabled = false,
    className = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    ...rest
}) {
    const [internal, setInternal] = useState(defaultValue);
    const controlled = value !== undefined;
    const selected = controlled ? value : internal;
    const groupRef = useRef(null);
    const id = useId();

    const select = next => {
        if (disabled) return;
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    const onKeyDown = event => {
        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;

        const options = Array.from(
            groupRef.current?.querySelectorAll('[role="radio"]:not([disabled])') ?? []
        );
        const current = options.indexOf(document.activeElement);
        if (current === -1) return;

        event.preventDefault();

        const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? options.length - 1
                  : (current + (forward ? 1 : -1) + options.length) % options.length;

        const target = options[next];
        target?.focus();
        /* Selection follows focus. This is the behaviour that distinguishes a
         * radio group from a tablist, and screen-reader users rely on it. */
        if (target?.dataset.value !== undefined) select(target.dataset.value);
    };

    return (
        <RadioContext.Provider value={{ selected, select, disabled, name, id }}>
            <div
                ref={groupRef}
                role="radiogroup"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-orientation={orientation}
                onKeyDown={onKeyDown}
                className={className}
                {...rest}
            >
                {name && selected !== undefined && (
                    <input type="hidden" name={name} value={selected ?? ''} readOnly />
                )}
                {children}
            </div>
        </RadioContext.Provider>
    );
}

/**
 * `first` marks the option that takes the tab stop when nothing is selected.
 * Passed rather than inferred: the group would otherwise have to inspect its own
 * children, which breaks the moment an option is wrapped in anything.
 */
function RadioOption({
    value,
    disabled: optionDisabled = false,
    first = false,
    className = '',
    children,
    ...rest
}) {
    const context = useContext(RadioContext);
    if (!context) return null;

    const checked = context.selected === value;
    const disabled = context.disabled || optionDisabled;
    /* Nothing selected → the first option holds the group's single tab stop. */
    const tabbable = checked || (context.selected === undefined && first);

    return (
        <button
            type="button"
            role="radio"
            data-value={value}
            data-state={checked ? 'checked' : 'unchecked'}
            aria-checked={checked}
            disabled={disabled}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => context.select(value)}
            className={`cursor-pointer border-none bg-transparent text-left disabled:cursor-default disabled:opacity-40 ${className}`}
            {...rest}
        >
            {typeof children === 'function' ? children({ checked }) : children}
        </button>
    );
}

RadioGroup.Option = RadioOption;
