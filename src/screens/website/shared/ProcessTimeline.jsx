import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionReveal from './SectionReveal.jsx';
import { useReducedMotion } from './reducedMotion.js';
import { useScrollFrame } from './frameContext.js';

/**
 * An ordered sequence of steps with a rail that fills as you scroll past it.
 *
 * Nothing in the library did this — `ROADMAP.md` Tier 3. Numbered process
 * sections ("how a commission works", "our method") are one of the commonest
 * things a marketing page needs and the one shape none of the 25 templates
 * grew, so unlike its neighbours this component has no original to be faithful
 * to and no second copy to reconcile against.
 *
 * ─── `<ol>`, not divs ────────────────────────────────────────────────────────
 *
 * The content is ordered and the DOM should say so. A screen reader announcing
 * "list, 6 items, item 2 of 6" is carrying the same information the rail
 * carries visually, and it is free. `numbered` only controls whether the index
 * is *drawn* — the ordering is in the markup either way, which is why a step
 * may also carry its own `label` ("Week one") without losing its position.
 *
 * ─── The rail ────────────────────────────────────────────────────────────────
 *
 * `useScroll` is given `container: useScrollFrame()`. Every template here is a
 * `position: fixed` page that scrolls internally, so the window's scroll is a
 * constant zero and a `useScroll` without `container` produces a rail that
 * never moves. This is the single most common way a scroll effect dies in this
 * library, and it fails silently.
 *
 * The fill is a `scaleY` on a `motion.div` with `transformOrigin: top`, not an
 * animated `height`: transforms are composited, heights are not, and this one
 * updates on every scroll frame.
 *
 * ─── Reduced motion is not a transition here ─────────────────────────────────
 *
 * The rail is scroll-*linked*, so `useMotionTransition` has nothing to zero —
 * there is no duration, the user is driving it directly. The question is
 * instead whether the effect should exist at all, and the answer is no: a fill
 * that only moves because the reader scrolled is still movement they asked not
 * to have. Under `useReducedMotion()` the rail renders **statically at full
 * length** and the steps drop their travel (which `SectionReveal` already does
 * for itself). The section keeps its structure and loses its animation, which
 * is the distinction the whole `reducedMotion` module is drawn around.
 *
 * ─── Orientation is a literal, not a breakpoint prop ─────────────────────────
 *
 * `responsive` renders hard-coded `flex-col md:flex-row`. It cannot be built
 * from a prop — Tailwind scans source text for class names, so a computed
 * `md:${dir}` is never generated and the layout silently stays vertical.
 *
 * @example Marlowe — six appointments over six months
 * <ProcessTimeline steps={commission.steps} icons={ICONS}
 *                  markerClassName="border-marlowe-gold text-marlowe-gold"
 *                  railClassName="bg-marlowe-gold/25" />
 */

const ORIENTATIONS = {
    vertical: {
        list: 'flex flex-col gap-10',
        rail: 'absolute top-0 bottom-0 left-[15px] w-px',
        fillAxis: 'scaleY',
        origin: 'top',
        item: 'relative flex gap-6 pl-0',
    },
    horizontal: {
        list: 'flex flex-row gap-8',
        rail: 'absolute top-[15px] right-0 left-0 h-px',
        fillAxis: 'scaleX',
        origin: 'left',
        item: 'relative flex flex-1 flex-col gap-4',
    },
    responsive: {
        list: 'flex flex-col gap-10 md:flex-row md:gap-8',
        rail: 'absolute top-0 bottom-0 left-[15px] w-px md:top-[15px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto',
        fillAxis: 'scaleY',
        origin: 'top',
        item: 'relative flex gap-6 md:flex-1 md:flex-col md:gap-4',
    },
};

export default function ProcessTimeline({
    steps = [],
    orientation = 'responsive',
    /** Draws `01`, `02`… when a step supplies no `label` of its own. */
    numbered = true,
    /** The scroll-linked rail. Off leaves the track drawn but unfilled. */
    progress = true,
    reveal = true,
    stagger = 0.08,
    /** Name → component, resolved from `step.icon`. A miss renders the index. */
    icons,
    as: Tag = 'ol',
    className = '',
    itemClassName = '',
    railClassName = 'bg-current/20',
    fillClassName = 'bg-current',
    markerClassName = 'border-current',
    titleClassName = '',
    bodyClassName = '',
    metaClassName = '',
    renderStep,
    ...rest
}) {
    const reduced = useReducedMotion();
    const frameRef = useScrollFrame();
    const railRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: railRef,
        container: frameRef,
        offset: ['start 80%', 'end 60%'],
    });

    const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

    if (!steps.length) return null;

    const o = ORIENTATIONS[orientation] ?? ORIENTATIONS.responsive;
    const Item = reveal ? SectionReveal : 'li';

    return (
        <div ref={railRef} className={`relative ${className}`}>
            <span aria-hidden="true" className={`${o.rail} ${railClassName}`} />

            {progress ? (
                <motion.span
                    aria-hidden="true"
                    className={`${o.rail} ${fillClassName}`}
                    style={
                        reduced
                            ? undefined
                            : {
                                  [o.fillAxis]: fill,
                                  transformOrigin: o.origin,
                              }
                    }
                />
            ) : null}

            <Tag className={`m-0 list-none p-0 ${o.list}`} {...rest}>
                {steps.map((step, i) => {
                    const Icon = icons && step.icon ? icons[step.icon] : null;
                    const badge = step.label ?? (numbered ? String(i + 1).padStart(2, '0') : null);

                    const content = renderStep ? (
                        renderStep(step, i)
                    ) : (
                        <>
                            <span
                                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-inherit text-[11px] font-semibold tracking-[0.08em] ${markerClassName}`}
                            >
                                {Icon ? <Icon size={14} /> : badge}
                            </span>

                            <div className="min-w-0">
                                {Icon && badge ? (
                                    <p
                                        className={`m-0 mb-2 text-[11px] tracking-[0.28em] uppercase ${metaClassName}`}
                                    >
                                        {badge}
                                    </p>
                                ) : null}
                                <h3 className={`m-0 text-lg ${titleClassName}`}>{step.title}</h3>
                                {step.body ? (
                                    <p className={`m-0 mt-2 text-sm leading-relaxed ${bodyClassName}`}>
                                        {step.body}
                                    </p>
                                ) : null}
                                {step.meta ? (
                                    <p
                                        className={`m-0 mt-3 text-[11px] tracking-[0.18em] uppercase ${metaClassName}`}
                                    >
                                        {step.meta}
                                    </p>
                                ) : null}
                            </div>
                        </>
                    );

                    return reveal ? (
                        <Item
                            key={step.title ?? i}
                            as="li"
                            delay={i * stagger}
                            className={`${o.item} ${itemClassName}`}
                        >
                            {content}
                        </Item>
                    ) : (
                        <li key={step.title ?? i} className={`${o.item} ${itemClassName}`}>
                            {content}
                        </li>
                    );
                })}
            </Tag>
        </div>
    );
}
