import React from 'react';
import SectionReveal from './SectionReveal.jsx';

/**
 * Eyebrow, title, lead paragraph, optional action. Four templates grew one —
 * `MichaelSmith.jsx:111`, `Basilico.jsx:414`, `Aluma.jsx:104` and
 * `KnowItAll.jsx:74`.
 *
 * ─── What the four disagreed about, and how that becomes props ───────────────
 *
 * They differed on the *rule* beside the eyebrow (Michael Smith draws an 8px
 * hairline, the others do not), on whether part of the title is italic, and on
 * whether the action sits inline to the right or under the text. All three are
 * layout switches rather than different components, so they are `rule`,
 * `italic` and `layout`.
 *
 * What they agreed on — and what makes this worth sharing — is the *order* of
 * the four elements and the fact that the whole block enters as one unit rather
 * than staggering its own parts. A heading whose eyebrow arrives before its
 * title reads as two things.
 *
 * ─── Heading levels ──────────────────────────────────────────────────────────
 *
 * `as` defaults to `h2`, because these mark sections of a page whose `h1` is the
 * hero. It is a prop rather than fixed so a page that genuinely leads with one
 * of these can pass `h1` — the level must follow the document outline, not the
 * type size.
 *
 * The eyebrow is a `<p>`, deliberately. It is often the more specific label
 * ("Press", "02 — Services") and the temptation is to mark it up as the
 * heading, which puts a category name in the outline instead of the title.
 *
 * ─── Styling ─────────────────────────────────────────────────────────────────
 *
 * Every part takes its own `*ClassName`, and the defaults are structural only —
 * spacing and weight, no colour and no typeface. A shared component must not
 * carry a template's palette.
 *
 * @example Coinwise
 * <SectionHeading eyebrow="Markets" title="Every asset, one ledger"
 *     lead="Live prices across 40 pairs."
 *     titleClassName="text-coinwise-primary text-5xl font-extrabold" />
 */
export default function SectionHeading({
    eyebrow,
    title,
    /** Rendered inside the title in an `<em>`. `Michael Smith`'s serif accent. */
    italic,
    lead,
    action,
    as: Tag = 'h2',
    /** `stacked` puts the action below; `split` pushes it to the right. */
    layout = 'split',
    /** The hairline before the eyebrow. */
    rule = false,
    align = 'left',
    reveal = true,
    className = '',
    eyebrowClassName = 'text-xs tracking-[0.3em] uppercase opacity-60',
    ruleClassName = 'h-px w-8 bg-current opacity-30',
    titleClassName = 'text-4xl tracking-tight md:text-5xl',
    leadClassName = 'mt-4 max-w-md text-sm opacity-70 md:text-base',
    ...rest
}) {
    const centred = align === 'center';

    const body = (
        <>
            {eyebrow && (
                <p
                    className={`m-0 flex items-center gap-3 ${
                        centred ? 'justify-center' : ''
                    } ${eyebrowClassName}`}
                >
                    {rule && <span aria-hidden="true" className={ruleClassName} />}
                    {eyebrow}
                </p>
            )}

            {title && (
                <Tag className={`m-0 ${eyebrow ? 'mt-5' : ''} ${titleClassName}`}>
                    {title}
                    {italic && (
                        <>
                            {' '}
                            <em className="font-serif-accent italic">{italic}</em>
                        </>
                    )}
                </Tag>
            )}

            {lead && (
                <p className={`m-0 ${centred ? 'mx-auto' : ''} ${leadClassName}`}>{lead}</p>
            )}
        </>
    );

    /* One reveal around the whole block, never one per part. */
    const Wrapper = reveal ? SectionReveal : 'div';
    const wrapperProps = reveal ? { as: 'div' } : {};

    if (layout === 'split' && action) {
        return (
            <Wrapper
                {...wrapperProps}
                className={`flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end ${className}`}
                {...rest}
            >
                <div className="min-w-0">{body}</div>
                <div className="shrink-0">{action}</div>
            </Wrapper>
        );
    }

    return (
        <Wrapper
            {...wrapperProps}
            className={`${centred ? 'text-center' : ''} ${className}`}
            {...rest}
        >
            {body}
            {action && <div className={`mt-8 ${centred ? 'flex justify-center' : ''}`}>{action}</div>}
        </Wrapper>
    );
}
