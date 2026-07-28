import React, { useState } from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * A checkbox that the template draws.
 *
 * Same reasoning as `Switch` and `Select`: `<input type="checkbox">` is painted
 * by the OS in the system accent colour, and `appearance: none` discards the
 * control rather than restyling it. `role="checkbox"` on a `<button>` keeps the
 * keyboard behaviour a native one has and hands the drawing back to the page.
 *
 * ─── Indeterminate ───────────────────────────────────────────────────────────
 *
 * `checked="mixed"` is supported because a native checkbox's `indeterminate` is
 * a DOM *property* that no attribute can set — every implementation ends up
 * reaching for a ref in an effect. As an ARIA state it is just a value.
 *
 * ─── Labelling ───────────────────────────────────────────────────────────────
 *
 * `label` renders a `<span>` beside the button, inside a wrapper that is **not**
 * a `<label>` element, and points `aria-labelledby` at it. Wrapping would
 * forward the label's click into the button and toggle twice — the trap called
 * out in `README.md`. The wrapper does carry an `onClick`, so clicking the text
 * still works; it just goes through one handler rather than two.
 */
export default function Checkbox({
    checked,
    defaultChecked = false,
    onChange,
    name,
    value = 'on',
    label,
    disabled = false,
    className = '',
    boxClassName = 'border border-current/30',
    labelClassName = 'text-sm',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
}) {
    const [internal, setInternal] = useState(defaultChecked);
    const controlled = checked !== undefined;
    const state = controlled ? checked : internal;
    const on = state === true;
    const mixed = state === 'mixed';

    const generatedId = React.useId();
    const fieldId = id ?? generatedId;
    const labelId = label ? `${fieldId}-label` : undefined;

    const toggle = () => {
        if (disabled) return;
        /* From mixed, the next state is checked — the same as a native
         * indeterminate checkbox, which resolves to checked on first press. */
        const next = mixed ? true : !on;
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    return (
        <span
            className={`inline-flex items-center gap-2.5 ${
                disabled ? 'opacity-40' : 'cursor-pointer'
            } ${className}`}
            onClick={label ? toggle : undefined}
            {...rest}
        >
            {name && (on || mixed) && <input type="hidden" name={name} value={value} readOnly />}

            <button
                type="button"
                role="checkbox"
                id={fieldId}
                aria-checked={mixed ? 'mixed' : on}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy ?? labelId}
                aria-describedby={ariaDescribedBy}
                disabled={disabled}
                data-state={mixed ? 'mixed' : on ? 'checked' : 'unchecked'}
                onClick={event => {
                    /* The wrapper already handles this when there is a label —
                     * without the stop it would toggle, then toggle back. */
                    event.stopPropagation();
                    toggle();
                }}
                className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] bg-transparent p-0 transition-colors disabled:cursor-default ${boxClassName}`}
            >
                {mixed ? (
                    <Minus size={13} strokeWidth={3} aria-hidden="true" />
                ) : (
                    <Check
                        size={13}
                        strokeWidth={3}
                        aria-hidden="true"
                        className="transition-opacity"
                        style={{ opacity: on ? 1 : 0 }}
                    />
                )}
            </button>

            {label && (
                <span id={labelId} className={labelClassName}>
                    {label}
                </span>
            )}
        </span>
    );
}
