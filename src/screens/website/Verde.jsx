import React, { useCallback, useEffect, useState } from 'react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import VideoPlayer from './shared/VideoPlayer.jsx';

/**
 * Verde — a luxury nature hero that sits *inside* the page rather than taking
 * it over: a bounded, rounded card on a white field, with the video, the nav
 * and the whole composition clipped to its corners.
 *
 * Two details carry the design.
 *
 * The **concave fillet** on the bottom-right tab. The tab is a white block with
 * `rounded-t-[24px]`, which turns its own top corners *outward*. To read as a
 * piece cut out of the frame rather than a card laid on top, the join on its
 * left has to curve the other way — so a 24×24 SVG sits just outside that edge
 * filling everything except a quarter-disc, and the negative corner is the gap.
 *
 * The **video modal**. A separate element rather than the background clip
 * reused: the background one is muted and mid-loop, and unmuting it in place
 * would start the audio wherever the loop happened to be. Its chrome is
 * `./shared/VideoPlayer`, not the `controls` attribute — see that file.
 *
 * The brief is a standalone HTML file, so a few of its pieces are already this
 * repo's job and are dropped rather than reimplemented: the `<head>` font links
 * (index.html), the scrollbar skin and `body` reset (index.css), and the
 * `tailwind.config` block. That config also declares a `verde` colour ramp its
 * own markup never references — the palette on screen is white, black and
 * Tailwind's stock `emerald`, so nothing is added to `@theme` for it.
 */

const HERO_VIDEO = '/assets/verde/hero.mp4';

const NAV_LINKS = ['HOME', 'ABOUT', 'SERVICES', 'PROJECTS', 'CONTACT'];

const TAB_WORDS = ['SUSTAINABLE', 'INNOVATIVE', 'RESPONSIBLE'];

/** Drop-shadow that keeps white type legible over the brightest frames. */
const GLOW = '[text-shadow:0_4px_20px_rgb(0_0_0/0.6)]';

/** The sprout mark, at two stroke weights — 1.6 on the header, 2 on the tab. */
function Sprout({ className = '', strokeWidth = 1.6 }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 22V12" />
            <path d="M12 12C12 7.58172 8.41828 4 4 4C4 8.41828 7.58172 12 12 12Z" />
            <path d="M12 15C12 11.134 15.134 8 19 8C19 11.866 15.866 15 12 15Z" />
        </svg>
    );
}

/* -------------------------------------------------------------------------- */

function Header({ menuOpen, onToggleMenu }) {
    return (
        <header className="relative z-30 flex w-full items-center justify-between px-6 pt-6 pb-4 sm:px-10 sm:pt-8 lg:px-14">
            <a
                href="#"
                className="group flex items-center gap-2.5 text-xl font-light tracking-[0.2em] text-white no-underline transition-opacity hover:opacity-90 sm:text-2xl"
            >
                <Sprout className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12 sm:h-7 sm:w-7" />
                <span className="font-normal tracking-[0.25em]">VERDE</span>
            </a>

            <nav className="hidden items-center space-x-8 text-[12px] font-semibold tracking-[0.2em] text-white/90 uppercase lg:flex">
                {NAV_LINKS.map((link, i) => (
                    <a
                        key={link}
                        href={`#${link.toLowerCase()}`}
                        className="group relative py-1 no-underline transition-colors hover:text-white/70"
                    >
                        {link}
                        {/* HOME keeps its rule permanently; the rest wipe theirs
                         * in from the left on hover. */}
                        <span
                            className={`absolute bottom-0 left-0 h-px w-full bg-white transition-transform duration-300 ${
                                i === 0 ? '' : 'scale-x-0 group-hover:scale-x-100'
                            }`}
                        />
                    </a>
                ))}
            </nav>

            <div className="hidden items-center lg:flex">
                <a
                    href="#connect"
                    className="rounded-full border border-white/80 px-6 py-2.5 text-[11px] font-semibold tracking-[0.2em] text-white uppercase no-underline transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
                >
                    LET&apos;S CONNECT
                </a>
            </div>

            <button
                type="button"
                onClick={onToggleMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                className="cursor-pointer rounded-lg border-none bg-transparent p-2 text-white focus:ring-2 focus:ring-white/40 focus:outline-none lg:hidden"
            >
                <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                    />
                </svg>
            </button>
        </header>
    );
}

/* -------------------------------------------------------------------------- */

function MobileMenu({ open, onNavigate }) {
    return (
        <div
            className={`absolute inset-0 z-40 flex flex-col justify-between bg-black/95 p-8 pt-24 backdrop-blur-2xl transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
                open
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-4 opacity-0'
            }`}
        >
            <div className="flex flex-col space-y-5 text-center">
                {NAV_LINKS.map((link, i) => (
                    <a
                        key={link}
                        href={`#${link.toLowerCase()}`}
                        onClick={onNavigate}
                        className={`font-cormorant text-2xl tracking-widest no-underline transition-colors hover:text-emerald-300 ${
                            i === 0 ? 'text-white' : 'text-white/80'
                        }`}
                    >
                        {link}
                    </a>
                ))}
            </div>

            <div className="flex flex-col items-center space-y-5 border-t border-white/10 pt-4">
                <a
                    href="#connect"
                    onClick={onNavigate}
                    className="w-full rounded-full border border-white/80 py-3 text-center text-xs font-semibold tracking-[0.2em] text-white uppercase no-underline transition-all hover:bg-white hover:text-black"
                >
                    LET&apos;S CONNECT
                </a>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

/*
 * The player is mounted only while the modal is open, which is what starts and
 * stops it — no ref, no play/pause effect, and no chance of audio outliving the
 * overlay. Chrome comes from `./shared/VideoPlayer` rather than the `controls`
 * attribute: the native bar is drawn differently by every engine and ignores
 * this modal's radius and glass edge entirely.
 */
function VideoModal({ open, onClose }) {

    return (
        <div
            onClick={event => {
                if (event.target === event.currentTarget) onClose();
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-500 sm:p-10 ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
            <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close video"
                    className="absolute top-4 right-4 z-10 cursor-pointer rounded-full border-none bg-black/60 p-3 text-white transition-all hover:bg-white hover:text-black"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                {open && (
                    <VideoPlayer
                        src={HERO_VIDEO}
                        autoPlay
                        className="h-full w-full"
                        videoClassName="h-full w-full object-cover"
                    />
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

export default function Verde() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    /* One listener for both overlays, as the brief's single `keydown` handler
     * does — Escape dismisses whichever is showing. */
    useEffect(() => {
        const onKeyDown = event => {
            if (event.key !== 'Escape') return;
            setMenuOpen(false);
            setModalOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <PageFrame title="VERDE — Designed by Nature" className="type-jakarta bg-white">
            {/* Clear of the header inside the frame — the white page margin is
             * only 12–32px, so the corner itself is not free. */}
            <BackButton fixed top={120} left={28} />

            <div className="flex min-h-full flex-col items-center justify-center p-3 sm:p-5 md:p-8">
                <section className="relative my-auto flex h-[640px] w-full max-w-7xl flex-col justify-between overflow-hidden rounded-2xl border border-black/10 shadow-2xl sm:h-[700px] md:h-[740px] md:rounded-3xl lg:h-[780px]">
                    <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
                        <video
                            src={HERO_VIDEO}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-full w-full scale-[1.02] object-cover"
                        />
                        {/* Two overlays: a vertical ramp that anchors the type
                         * top and bottom, and a vignette that pulls the corners
                         * down so the rounded edge does not glow. */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-black/85" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(0_0_0/0.2)_60%,rgb(0_0_0/0.5)_100%)]" />
                    </div>

                    <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(open => !open)} />
                    <MobileMenu open={menuOpen} onNavigate={closeMenu} />

                    <div className="relative z-10 my-auto w-full px-6 pb-16 sm:px-10 sm:pb-20 lg:px-14">
                        <div className="max-w-3xl">
                            <h1
                                className={`font-cormorant m-0 text-5xl leading-[0.95] font-bold tracking-[-0.01em] text-white sm:text-6xl md:text-7xl lg:text-[95px] ${GLOW}`}
                            >
                                Designed
                                <br />
                                by Nature.
                            </h1>

                            <p
                                className={`mt-4 max-w-sm text-base leading-relaxed font-semibold text-white/90 sm:mt-6 sm:max-w-md md:text-lg ${GLOW}`}
                            >
                                Sustainable solutions for tomorrow.
                            </p>

                            <div className="mt-7 flex items-center gap-4 sm:mt-9 sm:gap-5">
                                <a
                                    href="#discover"
                                    className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3.5 text-xs font-semibold tracking-[0.18em] text-black uppercase no-underline shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20 active:scale-95 sm:px-8 sm:py-4 sm:text-sm"
                                >
                                    DISCOVER MORE
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setModalOpen(true)}
                                    aria-label="Play full video"
                                    className="group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/12 text-white backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 hover:border-white/60 hover:bg-white/25 sm:h-13 sm:w-13"
                                >
                                    <svg
                                        className="h-5 w-5 translate-x-0.5 fill-current transition-transform duration-300 group-hover:scale-110"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                    <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-white/40 opacity-20" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-0 bottom-0 z-30 flex items-center gap-3 rounded-t-[24px] bg-white px-6 py-4 text-black shadow-2xl sm:px-10 sm:py-5">
                        {/* The concave join. Sits in the 24px immediately left of
                         * the tab and fills all of it *except* a quarter-disc,
                         * so the white sweeps into the tab's own outward corner
                         * instead of ending in a step. */}
                        <svg
                            className="pointer-events-none absolute bottom-0 -left-[24px] h-6 w-6 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path d="M0,24 A24,24 0 0,0 24,0 L24,24 Z" fill="currentColor" />
                        </svg>

                        <Sprout className="h-4 w-4 shrink-0 text-black sm:h-5 sm:w-5" strokeWidth={2} />

                        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-black uppercase sm:gap-3 sm:text-xs">
                            {TAB_WORDS.map((word, i) => (
                                <React.Fragment key={word}>
                                    {i > 0 && <span className="text-black/40">•</span>}
                                    <span className="transition-colors hover:text-emerald-700">
                                        {word}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <VideoModal open={modalOpen} onClose={closeModal} />
        </PageFrame>
    );
}
