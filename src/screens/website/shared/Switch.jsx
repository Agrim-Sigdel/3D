import React, { useState } from 'react';
import { useMotionMs } from './reducedMotion.js';

/**
 * An on/off toggle — a pricing page's monthly/yearly, a settings row.
 *
 * ─── Why not `<input type="checkbox">` ──────────────────────────────────────
 *
 * The same argument `README.md` makes for `<select>`, applied one control
 * along. A native checkbox is drawn by the OS: macOS renders a rounded square
 * in the system accent colour, Windows a flat box with its own focus ring,
 * and `appearance: none` throws away the whole control including its keyboard
 * behaviour, leaving a div that has to be rebuilt anyway. There is no styling
 * path from a native checkbox to a sliding pill.
 *
 * So this is `role="switch"` on a `<button>`: announced as "on"/"off" rather
 * than "checked"/"unchecked", which is what a toggle is. Space and Enter both
 * flip it, for free, because it is a real button.
 *
 * A hidden input carries the value so the field still submits under its `name`
 * — the same contract `Select` and `DateField` keep. It is only rendered when
 * checked, matching how a real checkbox submits: absent means off.
 *
 * ─── Labelling ───────────────────────────────────────────────────────────────
 *
 * Never wrapped in a `<label>` — it is a button, so the label's click would be
 * forwarded and the switch would toggle twice. Use `FormField`, or pass
 * `aria-labelledby` pointing at your own `<span id>`.
 *
 * @example Axon — the billing-period toggle
 * <Switch checked={yearly} onChange={setYearly}
 *         aria-labelledby="billing-label"
 *         className="bg-[#1B133C]/15 data-[on=true]:bg-[#1B133C]" />
 */
export default function Switch({
    checked,
    defaultChecked = false,
    onChange,
    name,
    value = 'on',
    disabled = false,
    duration = 200,
    /** Dresses the track. `data-on` is set on it so state can be styled. */
    className = '',
    thumbClassName = 'bg-white',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
}) {
    const [internal, setInternal] = useState(defaultChecked);
    const controlled = checked !== undefined;
    const on = controlled ? checked : internal;
    const ms = useMotionMs(duration);

    const toggle = () => {
        if (disabled) return;
        const next = !on;
        if (!controlled) setInternal(next);
        onChange?.(next);
    };

    return (
        <>
            {name && on && <input type="hidden" name={name} value={value} readOnly />}

            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                disabled={disabled}
                data-on={on}
                onClick={toggle}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors disabled:cursor-default disabled:opacity-40 ${className}`}
                {...rest}
            >
                <span
                    aria-hidden="true"
                    className={`block h-6 w-6 rounded-full shadow-sm ${thumbClassName}`}
                    style={{
                        /* `translate3d` rather than `left`: the thumb keeps its
                         * own layer and the slide never triggers layout. */
                        transform: on ? 'translate3d(20px, 0, 0)' : 'translate3d(0, 0, 0)',
                        transitionProperty: 'transform',
                        transitionDuration: `${ms}ms`,
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                />
            </button>
        </>
    );
}
