import React, { useId } from 'react';

/**
 * Label, hint, error and required marker around one control — and the wiring
 * that connects them, which is the part that keeps being got wrong.
 *
 * ─── Why `children` is a function ────────────────────────────────────────────
 *
 * Because the control must not be wrapped in a `<label>`.
 *
 * `<button>` is a labelable element. `Select`, `DateField`, `TimeField`,
 * `Switch` and `QuantityStepper` are all buttons underneath, so a `<label>`
 * around one forwards its click into the trigger — the popover opens from the
 * label's click and shuts again from the trigger's, in a single gesture, and it
 * looks like the component is broken. `Aluma` and `Basilico` both hit this and
 * both ended up hand-rolling a `div` + id'd `<span>` + `aria-labelledby`.
 *
 * This packages that, and the ids have to reach the control somehow. A render
 * prop hands them over explicitly:
 *
 *     <FormField label="Arrival" hint="Check-in from 3pm" error={errors.date}>
 *         {ids => <DateField name="arrival" {...ids} />}
 *     </FormField>
 *
 * `ids` is `{ id, 'aria-labelledby', 'aria-describedby', 'aria-invalid' }`, so
 * it spreads straight onto any of the shared controls or onto a bare `<input>`.
 *
 * A plain element is accepted too, for the cases where a caller has already
 * wired its own ids — nothing is forced.
 *
 * ─── Error text is a live region ─────────────────────────────────────────────
 *
 * Validation that appears after a blur is a change the user did not initiate and
 * cannot see if they are not looking at it. `role="alert"` announces it.
 *
 * Hint and error are both referenced by `aria-describedby` and are joined with a
 * space rather than the error replacing the hint — "Check-in from 3pm" is still
 * true when the date is also invalid.
 */
export default function FormField({
    label,
    hint,
    error,
    required = false,
    /** Overrides the generated id when a caller needs a stable one. */
    id: providedId,
    className = '',
    labelClassName = 'text-xs font-medium tracking-wide uppercase opacity-70',
    hintClassName = 'text-xs opacity-50',
    errorClassName = 'text-xs text-red-500',
    children,
    ...rest
}) {
    const generated = useId();
    const id = providedId ?? generated;

    const labelId = `${id}-label`;
    const hintId = hint ? `${id}-hint` : null;
    const errorId = error ? `${id}-error` : null;

    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    const ids = {
        id,
        'aria-labelledby': label ? labelId : undefined,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
    };

    return (
        <div className={`flex flex-col gap-1.5 ${className}`} {...rest}>
            {label && (
                /* A `<span>`, deliberately. See the note above — this is the
                 * whole reason the component exists. */
                <span id={labelId} className={labelClassName}>
                    {label}
                    {required && (
                        <>
                            {' '}
                            <span aria-hidden="true">*</span>
                            <span className="sr-only">(required)</span>
                        </>
                    )}
                </span>
            )}

            {typeof children === 'function' ? children(ids) : children}

            {hint && (
                <span id={hintId} className={hintClassName}>
                    {hint}
                </span>
            )}

            {error && (
                <span id={errorId} role="alert" className={errorClassName}>
                    {error}
                </span>
            )}
        </div>
    );
}
