import React, { useEffect, useRef } from 'react';

/**
 * A looping background video that crossfades through black at the seam instead
 * of hard-cutting.
 *
 * `loop` is deliberately off. The native attribute restarts the file on the
 * same frame it ended, which reads as a jump on any clip whose first and last
 * frames differ. Here the element fades itself out over the last 0.55s, waits
 * out a 100ms hold at black, rewinds, and fades back in.
 *
 * Fades are driven by requestAnimationFrame writing `style.opacity` rather than
 * a CSS transition, for two reasons the specs call out: each new fade reads the
 * *current* opacity so an interrupted one resumes from where it stopped, and
 * cancelling is a `cancelAnimationFrame` rather than a fight with a running
 * transition.
 */

const FADE_MS = 500;
/** Seconds before `ended` that the fade-out starts. */
const FADE_OUT_LEAD = 0.55;

export default function FadingVideo({ src, className = '', style, ...rest }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        let rafId = 0;
        let holdTimer = 0;
        let fadingOut = false;

        const fadeTo = (target, duration = FADE_MS) => {
            cancelAnimationFrame(rafId);

            const from = Number.parseFloat(video.style.opacity) || 0;
            const delta = target - from;
            if (delta === 0) return;

            let startedAt = null;
            const step = now => {
                startedAt ??= now;
                const t = Math.min((now - startedAt) / duration, 1);
                video.style.opacity = String(from + delta * t);
                if (t < 1) rafId = requestAnimationFrame(step);
            };
            rafId = requestAnimationFrame(step);
        };

        /* Autoplay can still be refused (a browser-level media setting, say);
         * the poster-less element then just stays at opacity 0 rather than
         * throwing an unhandled rejection. */
        const start = () => video.play().catch(() => {});

        const onLoadedData = () => {
            video.style.opacity = '0';
            start();
            fadeTo(1);
        };

        const onTimeUpdate = () => {
            const remaining = video.duration - video.currentTime;
            if (!fadingOut && remaining <= FADE_OUT_LEAD && remaining > 0) {
                fadingOut = true;
                fadeTo(0);
            }
        };

        const onEnded = () => {
            cancelAnimationFrame(rafId);
            video.style.opacity = '0';
            holdTimer = window.setTimeout(() => {
                video.currentTime = 0;
                start();
                fadingOut = false;
                fadeTo(1);
            }, 100);
        };

        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('ended', onEnded);

        /* A cached file can be ready before this effect runs, in which case
         * `loadeddata` has already fired and will not fire again. */
        if (video.readyState >= 2) onLoadedData();

        return () => {
            cancelAnimationFrame(rafId);
            window.clearTimeout(holdTimer);
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('ended', onEnded);
        };
    }, [src]);

    return (
        <video
            ref={videoRef}
            src={src}
            className={className}
            style={{ opacity: 0, ...style }}
            autoPlay
            muted
            playsInline
            preload="auto"
            {...rest}
        />
    );
}
