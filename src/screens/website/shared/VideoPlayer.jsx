import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';

/**
 * A video element with controls this library drew, rather than the browser's.
 *
 * `<video controls>` is the same problem as `<select>`: Chrome, Safari and
 * Firefox each draw a different bar in their own colours, and Safari's floats a
 * translucent slab that ignores the surrounding radius entirely. On a modal
 * that has been given a 1rem border and a glass edge, the native bar is the one
 * element that did not get the memo.
 *
 * Two implementation notes.
 *
 * **The scrubber is not `<input type="range">`.** That control is stylable, but
 * only through a thicket of `::-webkit-slider-thumb` / `::-moz-range-thumb`
 * pseudo-elements that behave differently per engine. A div with a pointer
 * handler is less code and renders identically everywhere. Keyboard support is
 * re-added explicitly rather than inherited.
 *
 * **Progress is written to the DOM, not to state.** A React re-render per frame
 * to move a progress bar is the most expensive thing this component could do,
 * and none of it is visible in the tree — so the fill width and the time label
 * are set directly on their nodes from a `requestAnimationFrame` loop, exactly
 * as the folder README requires of per-frame values. State holds only what
 * changes rarely: playing, muted, fullscreen.
 */

/** mm:ss, or h:mm:ss past the hour. */
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const total = Math.max(0, Math.floor(seconds));
    const s = String(total % 60).padStart(2, '0');
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

export default function VideoPlayer({
    src,
    poster,
    autoPlay = false,
    loop = false,
    className = '',
    videoClassName = 'h-full w-full object-cover',
}) {
    const wrapperRef = useRef(null);
    const videoRef = useRef(null);
    const fillRef = useRef(null);
    const handleRef = useRef(null);
    const currentRef = useRef(null);
    const durationRef = useRef(null);
    const trackRef = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [scrubbing, setScrubbing] = useState(false);

    /* Paint the bar and the clock straight onto their nodes. */
    const paint = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        const ratio = video.duration ? video.currentTime / video.duration : 0;
        const percent = `${(ratio * 100).toFixed(3)}%`;
        if (fillRef.current) fillRef.current.style.width = percent;
        if (handleRef.current) handleRef.current.style.left = percent;
        if (currentRef.current) currentRef.current.textContent = formatTime(video.currentTime);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        let rafId = 0;
        const tick = () => {
            paint();
            rafId = requestAnimationFrame(tick);
        };

        const onPlay = () => {
            setPlaying(true);
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(tick);
        };
        const onPause = () => {
            setPlaying(false);
            cancelAnimationFrame(rafId);
            paint();
        };
        const onLoaded = () => {
            if (durationRef.current) durationRef.current.textContent = formatTime(video.duration);
            paint();
        };
        const onVolume = () => setMuted(video.muted);

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onPause);
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('volumechange', onVolume);
        video.addEventListener('seeked', paint);

        if (video.readyState >= 1) onLoaded();
        if (!video.paused) onPlay();

        return () => {
            cancelAnimationFrame(rafId);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onPause);
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('volumechange', onVolume);
            video.removeEventListener('seeked', paint);
        };
    }, [paint, src]);

    useEffect(() => {
        const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const toggle = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play().catch(() => {});
        else video.pause();
    }, []);

    const seekToClientX = useCallback(clientX => {
        const track = trackRef.current;
        const video = videoRef.current;
        if (!track || !video || !Number.isFinite(video.duration)) return;
        const rect = track.getBoundingClientRect();
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        video.currentTime = ratio * video.duration;
    }, []);

    /* Drag continues outside the track, so the move and up listeners go on the
     * window rather than the element. */
    useEffect(() => {
        if (!scrubbing) return undefined;
        const onMove = event => seekToClientX(event.clientX);
        const onUp = () => setScrubbing(false);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [scrubbing, seekToClientX]);

    const nudge = useCallback(seconds => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.min(
            Math.max(video.currentTime + seconds, 0),
            video.duration || 0
        );
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else wrapperRef.current?.requestFullscreen?.().catch(() => {});
    }, []);

    const onKeyDown = event => {
        const map = {
            ' ': () => toggle(),
            k: () => toggle(),
            ArrowLeft: () => nudge(-5),
            ArrowRight: () => nudge(5),
            m: () => {
                const video = videoRef.current;
                if (video) video.muted = !video.muted;
            },
            f: () => toggleFullscreen(),
        };
        const action = map[event.key] ?? map[event.key.toLowerCase()];
        if (!action) return;
        event.preventDefault();
        action();
    };

    const iconButton =
        'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white/25';

    return (
        <div
            ref={wrapperRef}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="group"
            aria-label="Video player"
            className={`group relative overflow-hidden bg-black outline-none ${className}`}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                autoPlay={autoPlay}
                loop={loop}
                playsInline
                preload="metadata"
                onClick={toggle}
                className={`cursor-pointer ${videoClassName}`}
            />

            {/* Centre play badge, only while paused. */}
            {!playing && (
                <button
                    type="button"
                    onClick={toggle}
                    aria-label="Play"
                    className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md transition-transform hover:scale-110"
                >
                    <Play size={22} className="translate-x-0.5 fill-current" />
                </button>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4">
                <div className="pointer-events-auto flex flex-col gap-2 px-4">
                    <div
                        ref={trackRef}
                        role="slider"
                        tabIndex={-1}
                        aria-label="Seek"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        onPointerDown={event => {
                            setScrubbing(true);
                            seekToClientX(event.clientX);
                        }}
                        className="relative h-6 cursor-pointer touch-none"
                    >
                        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
                        <span
                            ref={fillRef}
                            style={{ width: '0%' }}
                            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-white"
                        />
                        <span
                            ref={handleRef}
                            style={{ left: '0%' }}
                            className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-transform ${
                                scrubbing ? 'scale-125' : 'scale-0 group-hover:scale-100'
                            }`}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggle}
                            aria-label={playing ? 'Pause' : 'Play'}
                            className={iconButton}
                        >
                            {playing ? (
                                <Pause size={16} className="fill-current" />
                            ) : (
                                <Play size={16} className="translate-x-px fill-current" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const video = videoRef.current;
                                if (video) video.muted = !video.muted;
                            }}
                            aria-label={muted ? 'Unmute' : 'Mute'}
                            className={iconButton}
                        >
                            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        <p className="m-0 font-mono text-xs text-white/80 tabular-nums">
                            <span ref={currentRef}>0:00</span>
                            <span className="mx-1 text-white/40">/</span>
                            <span ref={durationRef}>0:00</span>
                        </p>

                        <span className="flex-1" />

                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
                            className={iconButton}
                        >
                            {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
