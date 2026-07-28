import React from 'react';
import Modal from './Modal.jsx';
import VideoPlayer from './VideoPlayer.jsx';

/**
 * A clip played full-size over a scrim — `Verde.jsx:176` and
 * `NaturaVista.jsx:263`, which were the same forty lines apart from a scrim
 * colour, a radius and a hover tint.
 *
 * ─── The player is mounted only while open ───────────────────────────────────
 *
 * That is what starts and stops it: no ref, no play/pause effect, and no chance
 * of audio outliving the overlay. `Modal` keeps its own children mounted so the
 * fade-out has something to fade, so the gate has to be here rather than there.
 *
 * ─── Chrome comes from `VideoPlayer`, never `controls` ───────────────────────
 *
 * Safari floats a translucent slab straight through the radius of whatever
 * contains it, and every engine draws a different bar. A modal that has agreed
 * a radius and a border loses both the moment the native controls appear. See
 * `CATALOGUE.md` section `FC`.
 *
 * ─── Why not the background clip ─────────────────────────────────────────────
 *
 * Both originals point a fresh element at the same file rather than reusing the
 * page's background video, and that is correct: the background copy is muted and
 * mid-loop, so unmuting it in place starts the audio wherever the loop happened
 * to have got to.
 *
 * @example Verde
 * <VideoModal open={open} onClose={close} src={HERO_VIDEO}
 *             className="rounded-2xl border border-white/20"
 *             scrimClassName="bg-black/90" />
 */
export default function VideoModal({
    open = false,
    onClose,
    src,
    poster,
    label = 'Video player',
    /** Dresses the frame around the player. */
    className = 'rounded-2xl border border-white/20',
    scrimClassName = 'bg-black/90',
    closeClassName = '',
    duration = 500,
    ...rest
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            label={label}
            duration={duration}
            scrimClassName={scrimClassName}
            closeClassName={closeClassName}
            closeLabel="Close video"
            className={`aspect-video max-w-5xl overflow-hidden bg-black shadow-2xl ${className}`}
            {...rest}
        >
            {open && (
                <VideoPlayer
                    src={src}
                    poster={poster}
                    autoPlay
                    className="h-full w-full"
                    videoClassName="h-full w-full object-cover"
                />
            )}
        </Modal>
    );
}
