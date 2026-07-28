import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from './reducedMotion.js';
import { useScrollFrame } from './frameContext.js';

/**
 * Sticky cards that pile up, each shrinking as the next covers it.
 * `Jack.jsx:433` and `Outbox.jsx:364`.
 *
 * ─── The two originals differ, and `CATALOGUE.md` says to diff them ──────────
 *
 * `Jack` drives every card's scale from the *whole section's* progress, so a
 * card starts shrinking the moment the section does and the deck compresses
 * continuously. `Outbox` gives each card a fixed slice of the section and a
 * per-index scale ladder, so a card holds full size until its own slice begins.
 *
 * `ramp="section"` and `ramp="slice"` are those two. Continuous is the default
 * because it is the one that reads as depth rather than as steps.
 *
 * ─── `position: sticky`, not ScrollTrigger's `pin` ───────────────────────────
 *
 * `CATALOGUE.md` again: sticky works natively inside the frame and is exactly
 * `pin` with `pinSpacing: false`. GSAP's would need its `scroller` rewired to
 * `PageFrame` for every trigger on the page.
 *
 * ─── `useScrollFrame()` ──────────────────────────────────────────────────────
 *
 * Passed as `container`. Without it `useScroll` measures the window, whose
 * `scrollY` is a constant zero in this library, and every card sits at scale 1
 * forever — the failure is silent, which is why it is worth stating twice.
 *
 * ─── `transform-origin: top` ─────────────────────────────────────────────────
 *
 * A card scaled about its centre pulls its top edge down away from the sticky
 * offset, and the deck's top edges fan out instead of stacking. Scaling about
 * the top keeps every card's header on the same line, which is what makes the
 * pile read as a pile.
 *
 * ─── Reduced motion ──────────────────────────────────────────────────────────
 *
 * The scaling stops; the stickiness does not. The cards still stack and still
 * pin — they just do not shrink. Suppressing the layout as well would turn the
 * section into an ordinary list and lose the content's structure, which is more
 * than the preference asks for.
 *
 * @example Verde — services as a deck
 * <StackingCards items={SERVICES} top="top-24" cardClassName="rounded-[40px]">
 *     {(item, { index }) => <ServiceCard {...item} index={index} />}
 * </StackingCards>
 */
export default function StackingCards({
    items = [],
    ramp = 'section',
    /** How much smaller each card gets per card stacked on top of it. */
    step = 0.03,
    /** Vertical offset between successive cards' top edges, in px. */
    offset = 28,
    /** Tailwind sticky offset, e.g. `top-24`. */
    top = 'top-24',
    height = 'h-[85vh]',
    className = '',
    cardClassName = '',
    children,
    ...rest
}) {
    const listRef = useRef(null);
    const frame = useScrollFrame();

    const { scrollYProgress } = useScroll({
        target: listRef,
        container: frame ?? undefined,
        offset: ['start start', 'end end'],
    });

    return (
        <div ref={listRef} className={className} {...rest}>
            {items.map((item, index) => (
                <Card
                    key={item.id ?? item.name ?? index}
                    index={index}
                    total={items.length}
                    progress={scrollYProgress}
                    ramp={ramp}
                    step={step}
                    offset={offset}
                    top={top}
                    height={height}
                    className={cardClassName}
                >
                    {children?.(item, { index, total: items.length })}
                </Card>
            ))}
        </div>
    );
}

/**
 * Split out because `useTransform` is a hook and cannot be called in a loop
 * inside the parent — one component per card is the only shape React allows.
 */
function Card({ index, total, progress, ramp, step, offset, top, height, className, children }) {
    const reduced = useReducedMotion();

    /* How much this card ends up shrunk: one `step` for every card that will
     * cover it. The last card has none on top of it and never scales. */
    const target = 1 - (total - 1 - index) * step;

    /* `section` starts the shrink where this card pins and runs it to the end
     * of the section. `slice` confines it to this card's own share of the
     * scroll, so it holds full size until the next one is on its way. */
    const range =
        ramp === 'slice'
            ? [index / total, (index + 1) / total]
            : [index / total, 1];

    const scale = useTransform(progress, range, [1, target]);

    return (
        <div className={`sticky ${top} flex ${height} items-start justify-center`}>
            <motion.div
                className={`relative w-full origin-top ${className}`}
                style={{
                    /* Origin is `top` via the class above — scaling about the
                     * centre fans the deck's top edges apart. */
                    scale: reduced ? 1 : scale,
                    top: index * offset,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
