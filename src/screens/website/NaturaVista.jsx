import React, { useCallback, useEffect, useState } from 'react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import CrossfadeVideo from './shared/CrossfadeVideo.jsx';
import VideoPlayer from './shared/VideoPlayer.jsx';

/**
 * NaturaVista — a travel hero over one clip that never appears to end.
 *
 * The loop engine is the whole point of this design and it used to live here:
 * two copies of the file stacked, the outgoing one dipping only as the incoming
 * one rises, so the frame is never empty. `Aluma` became its second user, which
 * under this folder's rule is the moment to extract — it is now
 * `./shared/CrossfadeVideo` and this template was the last place still holding
 * the original.
 *
 * What stays local is the framing: half-speed playback, a two-second handover,
 * and the white wash over the top of the frame that gives the nav something to
 * sit on whatever the clip happens to be showing.
 */

const HERO_VIDEO = '/assets/naturavista/hero.mp4';

/** Cinematic slow motion. Also stretches the loop, so seams come rarely. */
const PLAYBACK_RATE = 0.5;
/** Real-time seconds before the end at which the incoming copy starts. */
const CROSSFADE_LEAD = 2;

const NAV_LINKS = ['Home', 'Destinations', 'Experiences', 'Sustainability', 'About Us', 'Blog'];

function Header({ menuOpen, onToggleMenu, onNavigate }) {
    return (
        <header className="relative z-20 mx-auto w-full max-w-7xl px-6 py-6 lg:px-12">
            <div className="flex items-center justify-between">
                <a href="#" className="flex items-center gap-3 no-underline">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950 text-white shadow-md">
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                        </svg>
                    </span>
                    <span className="font-cormorant text-2xl font-semibold tracking-wide text-emerald-950 lg:text-3xl">
                        NaturaVista
                    </span>
                </a>

                <nav className="hidden items-center space-x-8 text-sm font-medium tracking-wide md:flex">
                    {NAV_LINKS.map((link, i) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                            className="group relative py-1 text-emerald-900 no-underline transition-colors hover:text-emerald-950"
                        >
                            {link}
                            <span
                                className={`absolute -bottom-0.5 left-0 h-px w-full bg-emerald-950 transition-transform duration-300 ${
                                    i === 0 ? '' : 'scale-x-0 group-hover:scale-x-100'
                                }`}
                            />
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <a
                        href="#plan"
                        className="hidden items-center justify-center rounded-full border border-emerald-900/30 bg-white/50 px-6 py-2.5 text-xs font-semibold tracking-wider text-emerald-950 uppercase no-underline shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-emerald-950 hover:text-white sm:inline-flex"
                    >
                        Plan Your Escape
                    </a>

                    <button
                        type="button"
                        onClick={onToggleMenu}
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                        className="cursor-pointer rounded-full border border-emerald-900/20 bg-white/50 p-2.5 text-emerald-950 backdrop-blur-md md:hidden"
                    >
                        <svg
                            className="h-5 w-5"
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
                </div>
            </div>

            <div
                className={`mt-4 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/80 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
                    menuOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
                }`}
            >
                <div className="flex flex-col p-4">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={onNavigate}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-emerald-950 no-underline transition-colors hover:bg-emerald-950/5"
                        >
                            {link}
                        </a>
                    ))}
                    <a
                        href="#plan"
                        onClick={onNavigate}
                        className="mt-2 rounded-full bg-emerald-950 px-6 py-3 text-center text-xs font-semibold tracking-wider text-white uppercase no-underline sm:hidden"
                    >
                        Plan Your Escape
                    </a>
                </div>
            </div>
        </header>
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
            className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xl transition-opacity duration-300 sm:p-8 ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
            <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close video"
                    className="absolute top-4 right-4 z-10 cursor-pointer rounded-full border-none bg-black/60 p-3 text-white transition-all hover:bg-white hover:text-emerald-950"
                >
                    <svg
                        className="h-5 w-5"
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

export default function NaturaVista() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

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
        <PageFrame
            title="NaturaVista — Find Peace in Every Journey"
            scroll={false}
            className="type-jakarta bg-stone-100"
        >
            <BackButton fixed top={92} left={24} />

            <div className="relative flex h-full min-h-screen flex-col overflow-hidden">
                <CrossfadeVideo
                    src={HERO_VIDEO}
                    playbackRate={PLAYBACK_RATE}
                    crossfadeSeconds={CROSSFADE_LEAD}
                >
                    {/* Washes the top of the frame toward the page's stone so
                     * the dark emerald nav has something to sit on whatever the
                     * clip is doing. */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/20 to-transparent" />
                </CrossfadeVideo>

                <Header
                    menuOpen={menuOpen}
                    onToggleMenu={() => setMenuOpen(open => !open)}
                    onNavigate={closeMenu}
                />

                <div className="relative z-20 mx-auto my-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-12 text-center lg:px-12">
                    <div className="anim-stagger mx-auto flex max-w-3xl flex-col items-center space-y-6">
                        <div className="flex items-center justify-center gap-3">
                            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-700" />
                            <span className="text-xs font-bold tracking-[0.3em] text-emerald-900 uppercase sm:text-sm">
                                Discover. Explore. Belong.
                            </span>
                        </div>

                        <h1 className="font-cormorant m-0 text-center text-5xl leading-[1.05] font-medium tracking-tight text-emerald-950 sm:text-6xl md:text-7xl lg:text-8xl">
                            Find Peace in
                            <br />
                            <span className="font-normal italic">Every Journey</span>
                        </h1>

                        <div className="flex flex-col items-center pt-2">
                            <span className="mx-auto mb-6 h-[1.5px] w-16 bg-emerald-900/30" />
                            <p className="m-0 max-w-xl text-center text-base leading-relaxed font-medium text-emerald-900/90 sm:text-lg">
                                Curated travel experiences that connect you with nature, culture,
                                and yourself.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 sm:gap-6">
                            <a
                                href="#destinations"
                                className="group inline-flex items-center gap-3 rounded-full border border-emerald-800/50 bg-emerald-950 px-7 py-3.5 text-sm font-medium text-white no-underline shadow-xl transition-all duration-300 hover:bg-emerald-900"
                            >
                                Explore Destinations
                                <svg
                                    className="h-4 w-4 text-teal-300 transition-transform duration-300 group-hover:translate-x-1.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M5 12h14M13 5l7 7-7 7" />
                                </svg>
                            </a>

                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-emerald-900/20 bg-white/70 px-6 py-3.5 text-sm font-medium text-emerald-950 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950 text-white">
                                    <svg
                                        className="h-3 w-3 translate-x-px fill-current"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                </span>
                                Watch Video
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-center px-6 pt-4 pb-8 lg:px-12">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold tracking-[0.25em] text-emerald-900 uppercase">
                            Scroll to Explore
                        </span>
                        <span className="my-1 h-4 w-px bg-emerald-900/30" />
                        <span className="flex h-6 w-4 justify-center rounded-full border border-emerald-950/60 pt-1">
                            <span className="animate-scroll-dot h-1.5 w-[2px] rounded-full bg-emerald-950" />
                        </span>
                    </div>
                </div>
            </div>

            <VideoModal open={modalOpen} onClose={closeModal} />
        </PageFrame>
    );
}
