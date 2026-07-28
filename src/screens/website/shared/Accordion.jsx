import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { useMotionMs } from './reducedMotion.js';

/**
 * Disclosure rows. `ROADMAP.md`'s shortest note about Tier 3 is that **`FAQ`
 * *is* an `Accordion`** — build this and a whole class of section becomes
 * composition.
 *
 * ─── Two mechanisms, and the choice is not taste ─────────────────────────────
 *
 *   `grid`    `grid-template-rows: 0fr → 1fr`. Animates to the content's natural
 *             height without measuring it: no `scrollHeight` read, no
 *             ResizeObserver, and the right height even when a webfont lands
 *             after the panel has opened. This is `MobileMenu`'s `collapse`
 *             trick and it is the default.
 *
 *   `height`  Measured `max-height`, kept current by a ResizeObserver.
 *
 * The reason both exist: **`grid` requires `overflow: hidden` on the animating
 * box**, and that clips anything meant to escape the panel. Put a `Select` in a
 * `grid` panel and its popover is cut off at the panel's edge. `height` clips
 * only while moving and releases to `overflow: visible` once open, so a popover
 * inside it works. Pay the observer only when the content needs to escape.
 *
 * ─── Markup ──────────────────────────────────────────────────────────────────
 *
 * Not `<details>`/`<summary>`. Those cannot animate — the browser flips
 * `display` on the content — and Safari still exposes `summary` inconsistently.
 * This is the WAI-ARIA disclosure pattern: a `<button aria-expanded>` that
 * `aria-controls` a region, with Up/Down/Home/End moving between headers.
 *
 * @example Axion — a FAQ, one open at a time
 * <Accordion defaultValue="shipping">
 *     {FAQS.map(faq => (
 *         <Accordion.Item key={faq.q} value={faq.q}>
 *             <Accordion.Trigger className="…">{faq.q}</Accordion.Trigger>
 *             <Accordion.Panel className="…">{faq.a}</Accordion.Panel>
 *         </Accordion.Item>
 *     ))}
 * </Accordion>
 */

const AccordionContext = createContext(null);
const ItemContext = createContext(null);

export default function Accordion({
    /** `single` closes the open row when another opens. `multiple` does not. */
    type = 'single',
    /** Uncontrolled starting state: a value, or an array when `multiple`. */
    defaultValue,
    value,
    onValueChange,
    mechanism = 'grid',
    /** `single` only. Lets the open row be closed by pressing it again. */
    collapsible = true,
    duration = 350,
    className = '',
    children,
    ...rest
}) {
    const toArray = input => (input === undefined || input === null ? [] : [].concat(input));

    const [internal, setInternal] = useState(() => toArray(defaultValue));
    const controlled = value !== undefined;
    const openValues = controlled ? toArray(value) : internal;

    const listRef = useRef(null);

    const toggle = useCallback(
        item => {
            const isOpen = openValues.includes(item);

            let next;
            if (type === 'multiple') {
                next = isOpen ? openValues.filter(v => v !== item) : [...openValues, item];
            } else {
                next = isOpen ? (collapsible ? [] : openValues) : [item];
            }

            if (!controlled) setInternal(next);
            onValueChange?.(type === 'multiple' ? next : (next[0] ?? null));
        },
        [openValues, type, collapsible, controlled, onValueChange]
    );

    /* Roving between headers. Scoped by `data-accordion-trigger` rather than by
     * tag, so a panel containing its own buttons does not join the ring. */
    const onKeyDown = event => {
        const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;

        const triggers = Array.from(
            listRef.current?.querySelectorAll('[data-accordion-trigger]') ?? []
        );
        const current = triggers.indexOf(document.activeElement);
        if (current === -1) return;

        event.preventDefault();

        const target =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? triggers.length - 1
                  : (current + (event.key === 'ArrowDown' ? 1 : -1) + triggers.length) %
                    triggers.length;

        triggers[target]?.focus();
    };

    return (
        <AccordionContext.Provider value={{ openValues, toggle, mechanism, duration }}>
            <div ref={listRef} onKeyDown={onKeyDown} className={className} {...rest}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

function AccordionItem({ value, className = '', children, ...rest }) {
    const accordion = useContext(AccordionContext);
    const id = useId();
    const open = accordion?.openValues.includes(value) ?? false;

    return (
        <ItemContext.Provider value={{ value, open, id }}>
            <div data-state={open ? 'open' : 'closed'} className={className} {...rest}>
                {children}
            </div>
        </ItemContext.Provider>
    );
}

/**
 * The header button.
 *
 * `children` may be a function of `{ open }` so a caller can swap a chevron or a
 * +/− without needing its own subscription to the item's state.
 */
function AccordionTrigger({ className = '', children, ...rest }) {
    const accordion = useContext(AccordionContext);
    const item = useContext(ItemContext);
    if (!item) return null;

    return (
        <button
            type="button"
            data-accordion-trigger=""
            id={`${item.id}-trigger`}
            aria-expanded={item.open}
            aria-controls={`${item.id}-panel`}
            onClick={() => accordion?.toggle(item.value)}
            className={`flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent text-left ${className}`}
            {...rest}
        >
            {typeof children === 'function' ? children({ open: item.open }) : children}
        </button>
    );
}

function AccordionPanel({ className = '', children, ...rest }) {
    const accordion = useContext(AccordionContext);
    const item = useContext(ItemContext);
    const ms = useMotionMs(accordion?.duration ?? 350);

    const innerRef = useRef(null);
    const [height, setHeight] = useState(0);

    const measured = accordion?.mechanism === 'height';
    const open = item?.open ?? false;

    /* Only the measured mechanism observes. The grid one has no number to keep
     * current, which is the whole point of it. */
    useEffect(() => {
        if (!measured) return undefined;
        const element = innerRef.current;
        if (!element) return undefined;

        const observer = new ResizeObserver(([entry]) => {
            setHeight(entry.contentRect.height);
        });
        observer.observe(element);
        setHeight(element.getBoundingClientRect().height);

        return () => observer.disconnect();
    }, [measured]);

    if (!item) return null;

    const shared = {
        id: `${item.id}-panel`,
        role: 'region',
        'aria-labelledby': `${item.id}-trigger`,
        /* Closed panels leave the tab order. Without this, `overflow: hidden`
         * hides the links visually and the keyboard still walks into them — the
         * same bug the three `collapse` mobile menus shipped with. */
        inert: !open,
    };

    if (measured) {
        return (
            <div
                {...shared}
                style={{
                    maxHeight: open ? height : 0,
                    /* Released once open so a popover inside can escape the box.
                     * Kept hidden while moving, or the content spills past the
                     * animating edge. */
                    overflow: open ? 'visible' : 'hidden',
                    opacity: open ? 1 : 0,
                    transitionProperty: 'max-height, opacity',
                    transitionDuration: `${ms}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                {...rest}
            >
                <div ref={innerRef} className={className}>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div
            {...shared}
            className={`grid ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} overflow-hidden`}
            style={{
                transitionProperty: 'grid-template-rows, opacity',
                transitionDuration: `${ms}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: open ? 1 : 0,
            }}
            {...rest}
        >
            {/* `min-h-0` is load-bearing: without it the row refuses to shrink
             * below its content and the panel never closes. */}
            <div className="min-h-0">
                <div className={className}>{children}</div>
            </div>
        </div>
    );
}

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;
