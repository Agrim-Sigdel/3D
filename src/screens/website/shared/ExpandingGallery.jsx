import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionMs, useMotionTransition } from './reducedMotion.js';

/**
 * Panels in a row where the active one grows and its siblings shrink.
 * `Skyline.jsx:384`, `Outbox.jsx:395` and `Aluma.jsx:382`.
 *
 * ─── Two engines, and `CATALOGUE.md` is right that neither wins ──────────────
 *
 *   `css`     Tailwind-style `flex-grow` through a CSS transition. Cheap: no
 *             animation loop, one property, and it composes with `hover:`
 *             variants a caller might already be using.
 *
 *   `framer`  `animate={{ flexGrow }}` on a motion component. Costs a loop per
 *             panel, and buys the ability to compose with other motion values —
 *             a panel whose scale is also being driven by scroll progress
 *             cannot be done in CSS without the two fighting over `transform`.
 *
 * `css` is the default because the common case has nothing else moving.
 *
 * ─── `flexBasis: 0` is load-bearing ──────────────────────────────────────────
 *
 * Both originals set it. Without it `flex-grow` distributes only the *leftover*
 * space after each panel's content has been laid out, so a panel containing a
 * long title starts wider and the ratios never come out as written. With a zero
 * basis the whole row is leftover space and `flexGrow` is the ratio directly.
 *
 * ─── Interaction ─────────────────────────────────────────────────────────────
 *
 * Panels are `<button>`s and respond to `focus` as well as `pointerenter`, so
 * tabbing through the row opens each in turn — the three originals were all
 * hover-only, which made the whole section invisible from the keyboard.
 *
 * `activeIndex`/`onActiveChange` make it controllable, for a caller that wants
 * the row to reflect something else on the page. Uncontrolled it manages itself.
 *
 * ─── Mobile ──────────────────────────────────────────────────────────────────
 *
 * The row is `flex-col` below `md` with the growth disabled, because five
 * panels sharing a phone's width leaves each of them 60px whichever is active.
 * That is what all three originals do, and it is why `renderPanel` receives
 * `active` rather than the component deciding what a closed panel looks like.
 */
export default function ExpandingGallery({
    items = [],
    engine = 'css',
    /** Flex ratio for the open panel against `1` for the others. */
    grow = 4,
    activeIndex,
    onActiveChange,
    duration = 600,
    /** Applied to the row. Switch to a column here for the narrow case. */
    className = 'flex h-auto flex-col gap-3 md:h-[400px] md:flex-row',
    panelClassName = '',
    /** `(item, { active, index }) => ReactNode` */
    children,
    ...rest
}) {
    const [internal, setInternal] = useState(0);
    const controlled = activeIndex !== undefined;
    const active = controlled ? activeIndex : internal;

    const ms = useMotionMs(duration);
    const transition = useMotionTransition({
        duration: duration / 1000,
        ease: [0.25, 1, 0.5, 1],
    });

    const activate = index => {
        if (!controlled) setInternal(index);
        onActiveChange?.(index);
    };

    return (
        <div className={className} {...rest}>
            {items.map((item, i) => {
                const isActive = i === active;
                const flexGrow = isActive ? grow : 1;

                const shared = {
                    type: 'button',
                    onPointerEnter: () => activate(i),
                    /* Keyboard parity — the three originals had none. */
                    onFocus: () => activate(i),
                    onClick: () => activate(i),
                    'aria-expanded': isActive,
                    className: `group relative min-w-0 cursor-pointer overflow-hidden border-none p-0 text-left ${panelClassName}`,
                };

                const content = children?.(item, { active: isActive, index: i });

                /* `flexBasis: 0` — see the note above. `flexShrink: 1` lets a
                 * closed panel give up space rather than holding its content's
                 * width. */
                if (engine === 'framer') {
                    return (
                        <motion.button
                            key={item.id ?? item.name ?? i}
                            {...shared}
                            animate={{ flexGrow }}
                            transition={transition}
                            style={{ flexBasis: 0, flexShrink: 1 }}
                        >
                            {content}
                        </motion.button>
                    );
                }

                return (
                    <button
                        key={item.id ?? item.name ?? i}
                        {...shared}
                        style={{
                            flexGrow,
                            flexBasis: 0,
                            flexShrink: 1,
                            transitionProperty: 'flex-grow',
                            transitionDuration: `${ms}ms`,
                            transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
}
