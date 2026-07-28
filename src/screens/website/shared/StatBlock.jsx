import React from 'react';
import AnimatedCounter from './AnimatedCounter.jsx';

/**
 * A figure and what it means. Four templates carry one — `Securify.jsx:51`,
 * `MichaelSmith.jsx:605`, `Skyline`'s `STATS` and `Aster`'s — **and every one of
 * them is a static string** (`ROADMAP.md`).
 *
 * ─── Numbers count, strings do not ───────────────────────────────────────────
 *
 * `value` takes either. Given a number it renders an `AnimatedCounter`; given a
 * string it renders the string. That is what lets "+65k" and "4.8" and
 * "Intentional-First Design" all be stats without the caller branching, and it
 * means adopting the count-up is passing `value={65000}` instead of
 * `value="+65k"`.
 *
 * `prefix`/`suffix` exist so the counting part stays a real number:
 * `value={65} suffix="k"` counts, `value="65k"` cannot.
 *
 * ─── `<dl>`, not divs ────────────────────────────────────────────────────────
 *
 * A stat is a term and its description, which is what a description list is for.
 * The *value* is the `<dd>` and the *label* is the `<dt>` — that ordering looks
 * inverted against the visual order, where the big number comes first, so the
 * markup puts `<dt>` first and CSS `order` flips it. Reading order stays
 * "downloads: 300,000" rather than "300,000: downloads".
 *
 * The default `as="div"` is a wrapper HTML explicitly permits inside a `<dl>`,
 * so several blocks drop into one `StatBlock.Group` and share a single list.
 * **A block used on its own must pass `as="dl"`** — a `<dt>`/`<dd>` pair with no
 * list around it is invalid and exposed as nothing at all.
 *
 * @example Securify — a corner stat with a tilted rule, on its own
 * <StatBlock as="dl" value={65000} format={n => `+${(n / 1000).toFixed(0)}k`}
 *            label="startups use" align="right" />
 *
 * @example Coinwise — a band of four
 * <StatBlock.Group className="grid grid-cols-2 md:grid-cols-4">
 *     {STATS.map(s => <StatBlock key={s.label} {...s} />)}
 * </StatBlock.Group>
 */
export default function StatBlock({
    value,
    label,
    prefix = '',
    suffix = '',
    format,
    /** Turns the count off for a number that should simply be printed. */
    animate = true,
    /** Drawn before the value; `Securify`'s tilted hairline. */
    leading,
    /** Drawn after it. */
    trailing,
    align = 'left',
    as = 'div',
    className = '',
    valueClassName = 'text-4xl font-medium tracking-tight md:text-5xl',
    labelClassName = 'text-xs opacity-70 md:text-sm',
    ...rest
}) {
    const Tag = as;
    const alignment =
        align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start';

    const countable = typeof value === 'number' && animate;

    return (
        <Tag className={`flex flex-col ${alignment} ${className}`} {...rest}>
            {/* `order` puts the value above the label visually while the DOM
             * keeps term-then-description. See the note above. */}
            <dt className={`order-2 m-0 ${labelClassName}`}>{label}</dt>

            <dd className={`order-1 m-0 flex items-center gap-3 ${valueClassName}`}>
                {leading}
                {countable ? (
                    <AnimatedCounter
                        to={value}
                        prefix={prefix}
                        suffix={suffix}
                        format={format}
                    />
                ) : (
                    <span>
                        {prefix}
                        {format && typeof value === 'number' ? format(value) : value}
                        {suffix}
                    </span>
                )}
                {trailing}
            </dd>
        </Tag>
    );
}

/**
 * The `<dl>` several `StatBlock`s belong to.
 *
 * Without it each block is its own single-entry list, which a screen reader
 * announces as four separate lists of one item rather than one list of four.
 * `StatBlock` renders a bare `<div>` by default precisely so it can be dropped
 * inside this.
 */
function StatGroup({ className = '', children, ...rest }) {
    return (
        <dl className={`m-0 ${className}`} {...rest}>
            {children}
        </dl>
    );
}

StatBlock.Group = StatGroup;
