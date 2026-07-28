import { createContext, useContext, useEffect } from 'react';

/**
 * Context for the element that actually scrolls a website template.
 *
 * Templates in this library are `position: fixed` full-viewport pages, which
 * means the *window* never scrolls. Framer Motion's `useScroll` and any
 * hand-rolled `window.scrollY` maths read zero in that situation, so every
 * scroll-driven effect silently dies. `PageFrame` owns the scrolling element
 * and publishes its ref here; `useScrollFrame` hands that ref to
 * `useScroll({ container })`.
 *
 * `useInView` needs no equivalent — it observes against the viewport, and the
 * frame fills the viewport exactly, so intersection is already correct.
 *
 * Lives apart from PageFrame.jsx so that file only exports its component and
 * stays eligible for fast refresh.
 */
export const ScrollFrameContext = createContext(null);

/** The ref of the scrolling ancestor. Pass to `useScroll({ container })`. */
export function useScrollFrame() {
    return useContext(ScrollFrameContext);
}

/** Sets `document.title` for as long as the template is mounted. */
export function useDocumentTitle(title) {
    useEffect(() => {
        if (!title) return undefined;
        const previous = document.title;
        document.title = title;
        return () => {
            document.title = previous;
        };
    }, [title]);
}
