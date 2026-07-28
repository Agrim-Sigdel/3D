import React, { createContext, useContext, useId, useRef, useState } from 'react';

/**
 * A tablist and its panels. The WAI-ARIA tabs pattern, which is a specific set
 * of behaviours rather than "buttons that change some state":
 *
 *   - **Roving tabindex.** Exactly one tab is in the page's tab order. Tab moves
 *     *past* the tablist into the panel; the arrow keys move *within* it. A
 *     tablist of eight tabs that all take Tab is eight stops between the heading
 *     and the content.
 *   - Home/End jump to the ends. Arrows wrap.
 *   - `activation="automatic"` selects as focus moves, `"manual"` waits for
 *     Enter or Space. Automatic is the default and is right when panels are
 *     already in the DOM; use manual when selecting one is expensive, so
 *     arrowing past three tabs does not do three tabs' worth of work.
 *   - The panel is `aria-labelledby` its tab and `tabIndex={0}`, so a panel with
 *     no focusable content of its own can still be scrolled by keyboard.
 *
 * ─── Panels stay mounted ─────────────────────────────────────────────────────
 *
 * Hidden with the `hidden` attribute rather than unmounted. Unmounting throws
 * away scroll position and any state inside the panel, and makes crossfading
 * between panels impossible — `Axon`'s product tour animates its indicator rail
 * against a panel that is already laid out. Pass `unmountInactive` when a panel
 * carries something that must genuinely stop, such as a playing video.
 *
 * @example Axon — product tour
 * <Tabs defaultValue="inbox">
 *     <Tabs.List className="…" aria-label="Product areas">
 *         {AREAS.map(a => <Tabs.Tab key={a.id} value={a.id}>{a.label}</Tabs.Tab>)}
 *     </Tabs.List>
 *     {AREAS.map(a => <Tabs.Panel key={a.id} value={a.id}>…</Tabs.Panel>)}
 * </Tabs>
 */

const TabsContext = createContext(null);

export default function Tabs({
    defaultValue,
    value,
    onValueChange,
    activation = 'automatic',
    unmountInactive = false,
    className = '',
    children,
    ...rest
}) {
    const [internal, setInternal] = useState(defaultValue);
    const controlled = value !== undefined;
    const selected = controlled ? value : internal;
    const id = useId();

    const select = next => {
        if (!controlled) setInternal(next);
        onValueChange?.(next);
    };

    return (
        <TabsContext.Provider
            value={{ selected, select, activation, unmountInactive, id }}
        >
            <div className={className} {...rest}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

function TabsList({ className = '', children, ...rest }) {
    const context = useContext(TabsContext);
    const listRef = useRef(null);

    const onKeyDown = event => {
        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;

        const tabs = Array.from(listRef.current?.querySelectorAll('[role="tab"]') ?? []);
        const current = tabs.indexOf(document.activeElement);
        if (current === -1) return;

        event.preventDefault();

        const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? tabs.length - 1
                  : (current + (forward ? 1 : -1) + tabs.length) % tabs.length;

        const target = tabs[next];
        target?.focus();

        /* Automatic activation selects as focus lands. The element carries its
         * own value so the list does not need to know the children's props. */
        if (context?.activation === 'automatic' && target?.dataset.value !== undefined) {
            context.select(target.dataset.value);
        }
    };

    return (
        <div
            ref={listRef}
            role="tablist"
            onKeyDown={onKeyDown}
            className={className}
            {...rest}
        >
            {children}
        </div>
    );
}

function Tab({ value, className = '', children, ...rest }) {
    const context = useContext(TabsContext);
    if (!context) return null;

    const active = context.selected === value;

    return (
        <button
            type="button"
            role="tab"
            data-value={value}
            data-state={active ? 'active' : 'inactive'}
            id={`${context.id}-tab-${value}`}
            aria-selected={active}
            aria-controls={`${context.id}-panel-${value}`}
            /* The roving part: only the selected tab is reachable by Tab. */
            tabIndex={active ? 0 : -1}
            onClick={() => context.select(value)}
            className={`cursor-pointer border-none bg-transparent ${className}`}
            {...rest}
        >
            {typeof children === 'function' ? children({ active }) : children}
        </button>
    );
}

function TabsPanel({ value, className = '', children, ...rest }) {
    const context = useContext(TabsContext);
    if (!context) return null;

    const active = context.selected === value;
    if (!active && context.unmountInactive) return null;

    return (
        <div
            role="tabpanel"
            id={`${context.id}-panel-${value}`}
            aria-labelledby={`${context.id}-tab-${value}`}
            /* Focusable so a panel of plain prose is still scrollable from the
             * keyboard once Tab leaves the tablist. */
            tabIndex={0}
            hidden={!active}
            className={className}
            {...rest}
        >
            {children}
        </div>
    );
}

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabsPanel;
