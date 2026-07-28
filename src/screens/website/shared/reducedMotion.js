import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/**
 * `prefers-reduced-motion` for the animation this library actually runs.
 *
 * `index.css` already honours the preference, but only for CSS keyframes — it
 * sets `animation: none` on `.anim-stagger`, `.hero-anim` and friends. Every
 * Framer transition, every GSAP timeline and every inline CSS transition in
 * this folder ignores it completely, which is most of the movement on screen.
 * A user who has asked their OS for less motion still gets the full parallax,
 * the full stagger and the full slide-over.
 *
 * These three hooks are the fix, and every shared component is expected to use
 * one of them. They are deliberately small: the preference is a boolean, and
 * the only interesting question is what a component does with it. Suppressing
 * *movement* while keeping *state* is the goal — a menu that opens must still
 * open, it simply must not fly in from the top. So the pattern throughout is
 * to zero the duration and drop the translate, never to skip the state change.
 *
 * Three shapes cover everything in this folder:
 *
 *   const reduced = useReducedMotion();          // branch on it yourself
 *   const ms = useMotionMs(500);                 // CSS durations and delays
 *   const t = useMotionTransition({ ... });      // Framer `transition` objects
 *
 * Framer's own hook returns `null` before it has read the media query, which
 * is a third state every caller would otherwise have to handle. `?? false`
 * collapses it: unknown means animate, matching what the page does today.
 */

/** `true` when the user has asked for less movement. Never `null`. */
export function useReducedMotion() {
    return useFramerReducedMotion() ?? false;
}

/**
 * A duration or delay in milliseconds, collapsed to `0` under reduced motion.
 *
 * For CSS: inline `transitionDuration`/`transitionDelay`, or interpolated into
 * a `transition` shorthand. Returning `0` rather than omitting the transition
 * keeps the property list intact, so a caller can still interpolate it into a
 * template string without special-casing.
 */
export function useMotionMs(ms) {
    return useReducedMotion() ? 0 : ms;
}

/**
 * A Framer `transition` object with its timing zeroed under reduced motion.
 *
 * `duration: 0` rather than `type: false`, because Framer still fires
 * `onAnimationComplete` for a zero-duration tween — components that sequence
 * off that callback keep working. `delay` goes too: a stagger of instant
 * transitions is still a visible cascade, which is the thing being asked
 * against.
 */
export function useMotionTransition(transition) {
    const reduced = useReducedMotion();

    if (!reduced) return transition;

    return { ...transition, duration: 0, delay: 0 };
}
