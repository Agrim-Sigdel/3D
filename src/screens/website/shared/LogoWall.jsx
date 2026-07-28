import React from 'react';
import SectionReveal from './SectionReveal.jsx';

/**
 * A static grid of client, stockist or supplier marks.
 *
 * `ROADMAP.md` is emphatic that **this is not `Ticker`**: the scrolling variant
 * exists four times over, and a static grid of marks does not exist anywhere.
 * They read as opposite claims. A ticker says *there are too many to show*; a
 * wall says *here they all are, count them*. A heritage supplier list wants the
 * second and gets undermined by the first.
 *
 * ─── A logo without an image ─────────────────────────────────────────────────
 *
 * `src` is optional, and a mark without one **renders its `name` as set type**.
 * That is not a fallback grudgingly provided — it is what a supplier list
 * actually looks like on a trade page, and it is frequently the better version:
 * six wordmarks in one typeface read as a house's own list, where six
 * mismatched PNGs read as a sponsor board. It also means a caller with no
 * artwork at all still gets a real section rather than a row of broken tiles.
 *
 * `since` sets a second line under the name — `est. 1794` — which only makes
 * sense for the typographic form and is ignored when an image is supplied.
 *
 * ─── Columns are a lookup, not a template string ─────────────────────────────
 *
 * `columns` resolves through `COLUMN_CLASSES` rather than interpolating into
 * `grid-cols-${n}`. Tailwind finds classes by scanning source text, so an
 * interpolated one is never generated and the grid silently collapses to a
 * single column. This is the same reason `Aluma`'s gallery keeps a `SPANS`
 * table instead of computing its spans.
 *
 * @example Marlowe — six mills, no artwork, typographic
 * <LogoWall columns={3} logos={cloth.mills.items} label="Woven for this house by"
 *           nameClassName="font-cormorant text-marlowe-chalk" />
 */

/** Literal strings only — Tailwind cannot see an interpolated class. */
const COLUMN_CLASSES = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
};

export default function LogoWall({
    logos = [],
    columns = 4,
    /** Muted until hover. Applies to images only — type carries its own colour. */
    grayscale = true,
    /** Hairline cell borders. The trade-directory look. */
    divided = true,
    reveal = true,
    stagger = 0.05,
    /** Labels the list for assistive tech, and is shown when `showLabel`. */
    label,
    showLabel = false,
    as: Tag = 'ul',
    className = '',
    itemClassName = '',
    labelClassName = '',
    nameClassName = '',
    sinceClassName = '',
    ...rest
}) {
    if (!logos.length) return null;

    const cols = COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[4];

    /* The divider is one inset ring per cell rather than borders on the grid:
     * borders double up between neighbours and leave a heavier line inside than
     * out, which on a hairline is the difference between a rule and a smudge. */
    const cell = divided
        ? 'flex items-center justify-center p-6 shadow-[inset_0_0_0_1px_currentColor] opacity-100'
        : 'flex items-center justify-center p-6';

    const Item = reveal ? SectionReveal : 'li';

    return (
        <div className={className}>
            {label ? (
                <p
                    className={
                        showLabel
                            ? `m-0 mb-6 text-xs tracking-[0.3em] uppercase ${labelClassName}`
                            : 'sr-only'
                    }
                >
                    {label}
                </p>
            ) : null}

            <Tag className={`m-0 grid list-none p-0 ${cols}`} {...rest}>
                {logos.map((logo, i) => {
                    const inner = logo.node ?? (
                        logo.src ? (
                            <img
                                src={logo.src}
                                alt={logo.name}
                                loading="lazy"
                                className={`max-h-10 w-auto object-contain transition duration-500 ${
                                    grayscale
                                        ? 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                                        : ''
                                }`}
                            />
                        ) : (
                            <span className="flex flex-col items-center gap-1 text-center">
                                <span className={`text-sm tracking-[0.18em] uppercase ${nameClassName}`}>
                                    {logo.name}
                                </span>
                                {logo.since ? (
                                    <span className={`text-[11px] tracking-[0.12em] ${sinceClassName}`}>
                                        {logo.since}
                                    </span>
                                ) : null}
                            </span>
                        )
                    );

                    const content = logo.href ? (
                        <a href={logo.href} className="flex items-center justify-center no-underline">
                            {inner}
                        </a>
                    ) : (
                        inner
                    );

                    return reveal ? (
                        <Item
                            key={logo.name ?? i}
                            as="li"
                            delay={i * stagger}
                            y={12}
                            className={`${cell} ${itemClassName}`}
                        >
                            {content}
                        </Item>
                    ) : (
                        <li key={logo.name ?? i} className={`${cell} ${itemClassName}`}>
                            {content}
                        </li>
                    );
                })}
            </Tag>
        </div>
    );
}
