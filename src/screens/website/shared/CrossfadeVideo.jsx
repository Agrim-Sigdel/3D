import React, { useEffect, useRef } from 'react';

/**
 * A looping background video that crossfades into *itself* at the seam, so the
 * frame is never empty.
 *
 * Sibling to `./FadingVideo`, and the choice between them is about what the
 * seam is allowed to look like:
 *
 *   FadingVideo      one element, fades down to black, holds, rewinds, fades
 *                    back up. One decode. There is a dark beat at every loop.
 *   CrossfadeVideo   two elements playing the same file offset from each other,
 *                    the outgoing one dipping only as the incoming one rises.
 *                    No dark beat, at the cost of decoding the file twice.
 *
 * Use this one where the clip's first and last frames differ enough that a cut
 * would read as a jump *and* the design cannot afford to go dark — a hero whose
 * whole job is calm, typically. Use FadingVideo everywhere else; it is half the
 * decode.
 *
 * Timing runs off wall-clock seconds rather than media seconds. At
 * `playbackRate` 0.5 the last two seconds of the file take four real seconds to
 * play, so the handover point is `(duration - currentTime) / playbackRate`.
 * Reading media time directly starts the fade twice as early as intended.
 *
 * The loop is a `requestAnimationFrame` reading refs and writing `style`
 * straight to the elements. Nothing here calls `setState`: the swap happens once
 * per clip length, but the check happens every frame.
 */

const LAYER_CLASS = 'absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out';

export default function CrossfadeVideo({
    src,
    playbackRate = 1,
    /** Real-time seconds before the end at which the incoming copy starts. */
    crossfadeSeconds = 2,
    className = '',
    videoClassName = '',
    children,
}) {
    const aRef = useRef(null);
    const bRef = useRef(null);

    useEffect(() => {
        const a = aRef.current;
        const b = bRef.current;
        if (!a || !b) return undefined;

        const fadeMs = crossfadeSeconds * 1000;
        let current = a;
        let next = b;
        let rafId = 0;
        let swapTimer = 0;
        let crossfading = false;

        const play = video => video.play().catch(() => {});

        for (const video of [a, b]) {
            video.playbackRate = playbackRate;
            video.style.transitionDuration = `${fadeMs}ms`;
        }
        a.style.opacity = '1';
        b.style.opacity = '0';
        play(a);

        const tick = () => {
            rafId = requestAnimationFrame(tick);

            /* `duration` is NaN until metadata lands. */
            if (crossfading || !Number.isFinite(current.duration)) return;

            const remaining = (current.duration - current.currentTime) / playbackRate;
            if (remaining > crossfadeSeconds || remaining <= 0) return;

            crossfading = true;
            next.currentTime = 0;
            next.playbackRate = playbackRate;
            play(next);
            next.style.opacity = '1';
            current.style.opacity = '0';

            /* Park the outgoing copy only once it is invisible, so the rewind is
             * never on screen. */
            const outgoing = current;
            swapTimer = window.setTimeout(() => {
                outgoing.pause();
                outgoing.currentTime = 0;
                crossfading = false;
            }, fadeMs);

            [current, next] = [next, current];
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            window.clearTimeout(swapTimer);
            a.pause();
            b.pause();
        };
    }, [src, playbackRate, crossfadeSeconds]);

    return (
        <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
            {/* Written out rather than mapped over an array of refs: collecting
             * refs into an array during render is a lint error, and two is not
             * enough repetition to be worth working around it. */}
            <video
                ref={aRef}
                src={src}
                muted
                playsInline
                preload="auto"
                className={`${LAYER_CLASS} ${videoClassName}`}
            />
            <video
                ref={bRef}
                src={src}
                muted
                playsInline
                preload="auto"
                className={`${LAYER_CLASS} ${videoClassName}`}
                style={{ opacity: 0 }}
            />
            {children}
        </div>
    );
}
