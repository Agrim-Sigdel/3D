import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * −/value/+ for a cart line or a guest count.
 *
 * ─── The number is a real input ──────────────────────────────────────────────
 *
 * Unlike the other controls in this folder, the middle of a stepper stays an
 * `<input>`. `type="number"` is *not* the same problem as `<select>`: its
 * rendering is a plain text field, and the only OS chrome is the spinner, which
 * `appearance: textfield` removes without taking the control with it. Typing 12
 * beats pressing + eleven times, so the field has to stay typable.
 *
 * What it is not is `type="number"`. That control silently accepts `e`, `+` and
 * `-` (they are valid in a float literal), reports `value === ''` for input it
 * considers invalid — so a stray keystroke blanks the field with no way to read
 * what was typed — and scrolls the value when the wheel passes over a focused
 * field. `inputMode="numeric"` with a `[0-9]*` pattern gets the phone keypad
 * without any of that.
 *
 * ─── Committing ──────────────────────────────────────────────────────────────
 *
 * Free text is held locally while typing and only clamped on blur or Enter.
 * Clamping per keystroke makes "10" impossible to type into a field with a
 * minimum of 2: the "1" is corrected up before the "0" arrives.
 *
 * ─── Announcing ──────────────────────────────────────────────────────────────
 *
 * The buttons are `aria-controls` the field and disable at the bounds. Disabling
 * rather than silently ignoring is what tells a screen reader the end has been
 * reached — a button that stays enabled and does nothing reads as broken.
 */
export default function QuantityStepper({
    value,
    defaultValue = 1,
    onChange,
    min = 1,
    max = 99,
    step = 1,
    name,
    disabled = false,
    /** For "3 guests" / "3 items" in the buttons' labels. */
    unit = 'item',
    className = '',
    buttonClassName = 'h-8 w-8 border border-current/20',
    inputClassName = 'w-10',
    id,
    'aria-labelledby': ariaLabelledBy,
    ...rest
}) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    const [internal, setInternal] = useState(defaultValue);
    const controlled = value !== undefined;
    const current = controlled ? value : internal;

    /** `null` while the field is being typed in; the input shows `draft` then. */
    const [draft, setDraft] = useState(null);

    const commit = next => {
        const clamped = Math.min(Math.max(next, min), max);
        if (!controlled) setInternal(clamped);
        if (clamped !== current) onChange?.(clamped);
        return clamped;
    };

    const flush = () => {
        if (draft === null) return;
        const parsed = Number.parseInt(draft, 10);
        commit(Number.isNaN(parsed) ? current : parsed);
        setDraft(null);
    };

    const atMin = current <= min;
    const atMax = current >= max;

    return (
        <div className={`inline-flex items-center gap-2 ${className}`} {...rest}>
            {name && <input type="hidden" name={name} value={current} readOnly />}

            <button
                type="button"
                onClick={() => commit(current - step)}
                disabled={disabled || atMin}
                aria-controls={fieldId}
                aria-label={`Decrease ${unit} count`}
                className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors disabled:cursor-default disabled:opacity-30 ${buttonClassName}`}
            >
                <Minus size={14} />
            </button>

            <input
                id={fieldId}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                disabled={disabled}
                aria-labelledby={ariaLabelledBy}
                value={draft ?? current}
                onChange={event => setDraft(event.target.value.replace(/[^\d]/g, ''))}
                onBlur={flush}
                onKeyDown={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        flush();
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setDraft(null);
                        commit(current + step);
                    } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setDraft(null);
                        commit(current - step);
                    }
                }}
                className={`border-none bg-transparent text-center tabular-nums outline-none ${inputClassName}`}
            />

            <button
                type="button"
                onClick={() => commit(current + step)}
                disabled={disabled || atMax}
                aria-controls={fieldId}
                aria-label={`Increase ${unit} count`}
                className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors disabled:cursor-default disabled:opacity-30 ${buttonClassName}`}
            >
                <Plus size={14} />
            </button>
        </div>
    );
}
