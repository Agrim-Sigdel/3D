import { useCallback, useSyncExternalStore } from 'react';

/**
 * Media queries as React state, without the cascading render.
 *
 * ─── Why `useSyncExternalStore` and not `useState` + an effect ───────────────
 *
 * The obvious version reads `matchMedia(...).matches` inside an effect and
 * calls `setState` with it. That renders once at the wrong value, then again at
 * the right one — for a `pointer: fine` check the visible result is a custom
 * cursor or a hover-only affordance flashing on a touch device before it is
 * withdrawn. `react-hooks/set-state-in-effect` rejects it, and correctly.
 *
 * `useSyncExternalStore` is what the API is for: `getSnapshot` reads the value
 * during render so the first paint is already right, and `subscribe` wires the
 * change listener.
 *
 * ─── `addEventListener`, not `addListener` ───────────────────────────────────
 *
 * `MediaQueryList.addListener` is deprecated and was Safari's only option until
 * 14. Every browser this library targets — the same ones expected to decode
 * H.264 and honour `backdrop-filter` — has the modern one.
 */

/** `true` while the query matches. Re-renders when that changes. */
export function useMediaQuery(query) {
    const subscribe = useCallback(
        onChange => {
            const list = window.matchMedia(query);
            list.addEventListener('change', onChange);
            return () => list.removeEventListener('change', onChange);
        },
        [query]
    );

    const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

    return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 * `true` for a mouse or trackpad, `false` for touch.
 *
 * The gate for anything that has no meaning without a cursor: a follower, a
 * spotlight, a hover-only reveal. `Basilico` makes this check by hand at
 * `Basilico.jsx` and is the reason it is named rather than inlined — a raw
 * `useMediaQuery('(pointer: fine)')` at four call sites is four chances to
 * write `course` or drop the parentheses.
 */
export function usePointerFine() {
    return useMediaQuery('(pointer: fine)');
}
