import React, { useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';

/**
 * Lithos — a geology hero whose second image is only visible inside a soft
 * circle trailing the cursor, as though a torch were being moved over strata.
 *
 * Two full-bleed images are stacked. The upper one carries a CSS mask painted
 * each frame into a canvas: a radial gradient, opaque at the middle and feathered
 * to nothing at 260px, exported with `toDataURL()`. Where the mask is opaque the
 * upper image shows; everywhere else the lower one does.
 *
 * Two departures from the brief, both to keep the loop cheap:
 *
 *   The cursor is smoothed into a ref and the mask written straight to
 *   `style.maskImage`, rather than pushed through `setState` every frame — a
 *   60fps React re-render of the whole hero would be the most expensive thing
 *   on the page, and nothing about it would be visible.
 *
 *   The canvas is a quarter of the window's size. `mask-size: 100% 100%`
 *   stretches it back, and since the mask is a smooth gradient there is nothing
 *   in it that survives to a pixel; `toDataURL` at full resolution is what
 *   actually costs the frame.
 */

const BASE_IMAGE = '/assets/lithos/base.webp';
const REVEAL_IMAGE = '/assets/lithos/reveal.webp';

const SPOTLIGHT_R = 260;
const MASK_SCALE = 0.25;

/** [offset, alpha] — flat to 40%, then a long feather out to the rim. */
const MASK_STOPS = [
    [0, 1],
    [0.4, 1],
    [0.6, 0.75],
    [0.75, 0.4],
    [0.88, 0.12],
    [1, 0],
];

const NAV_LINKS = ['Field Guides', 'Geology', 'Plans', 'Live Tour'];

/* -------------------------------------------------------------------------- */

/**
 * Paints the spotlight mask onto the layer at `revealRef`. Owns its own rAF
 * loop, easing the drawn position toward the pointer at 0.1 per frame.
 */
function useSpotlight(revealRef) {
    useEffect(() => {
        const reveal = revealRef.current;
        if (!reveal) return undefined;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        /* Start outside the frame so the first paint masks everything out —
         * without it the layer renders unmasked for a frame and the reveal image
         * flashes over the base one. The spotlight then eases in from off-screen
         * on the first pointer move, which is the entrance the brief describes. */
        const pointer = { x: -999, y: -999 };
        const smooth = { x: -999, y: -999 };
        /* `null` rather than a pair of NaNs: `Math.abs(x - NaN) > 0.5` is false,
         * so a NaN sentinel makes the guard below reject every frame and the mask
         * never repaints at all. */
        let painted = null;
        let rafId = 0;

        const resize = () => {
            canvas.width = Math.max(1, Math.round(window.innerWidth * MASK_SCALE));
            canvas.height = Math.max(1, Math.round(window.innerHeight * MASK_SCALE));
            painted = null;
        };

        const paint = () => {
            const x = smooth.x * MASK_SCALE;
            const y = smooth.y * MASK_SCALE;
            const r = SPOTLIGHT_R * MASK_SCALE;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            for (const [offset, alpha] of MASK_STOPS) {
                gradient.addColorStop(offset, `rgba(255,255,255,${alpha})`);
            }
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            const url = `url(${canvas.toDataURL()})`;
            reveal.style.maskImage = url;
            reveal.style.webkitMaskImage = url;
        };

        const tick = () => {
            smooth.x += (pointer.x - smooth.x) * 0.1;
            smooth.y += (pointer.y - smooth.y) * 0.1;

            /* Sub-pixel drift is invisible but a repaint is not free. */
            if (
                !painted ||
                Math.abs(smooth.x - painted.x) > 0.5 ||
                Math.abs(smooth.y - painted.y) > 0.5
            ) {
                paint();
                painted = { x: smooth.x, y: smooth.y };
            }
            rafId = requestAnimationFrame(tick);
        };

        const onMove = event => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
        };

        resize();
        paint();
        window.addEventListener('mousemove', onMove);
        window.addEventListener('resize', resize);
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('resize', resize);
        };
    }, [revealRef]);
}

/* -------------------------------------------------------------------------- */

function Logo() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 256 256"
            fill="#ffffff"
            aria-hidden="true"
        >
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
    );
}

function Nav() {
    return (
        <nav className="fixed top-0 right-0 left-0 z-[100] flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-2">
                <Logo />
                <span className="font-playfair text-2xl text-white italic">Lithos</span>
            </div>

            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-md md:flex">
                <button
                    type="button"
                    className="cursor-pointer rounded-full border-none bg-transparent px-4 py-1.5 text-sm font-medium text-white"
                >
                    Course
                </button>
                {NAV_LINKS.map(link => (
                    <button
                        key={link}
                        type="button"
                        className="cursor-pointer rounded-full border-none bg-transparent px-4 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    >
                        {link}
                    </button>
                ))}
            </div>

            <button
                type="button"
                className="hidden cursor-pointer rounded-full border-none bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 md:block"
            >
                Sign Up
            </button>

            <button
                type="button"
                aria-label="Open menu"
                className="cursor-pointer border-none bg-transparent p-1 text-white md:hidden"
            >
                <Menu size={24} />
            </button>
        </nav>
    );
}

/* -------------------------------------------------------------------------- */

export default function Lithos() {
    const revealRef = useRef(null);
    useSpotlight(revealRef);

    return (
        <PageFrame
            title="Lithos — Layers Hold Tales of Time"
            scroll={false}
            className="type-inter bg-white tracking-[-0.02em]"
        >
            <BackButton top={70} left={16} />

            <section
                className="relative h-screen w-full overflow-hidden bg-black"
                style={{ height: '100dvh' }}
            >
                <div
                    className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${BASE_IMAGE})` }}
                />

                <div
                    ref={revealRef}
                    className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${REVEAL_IMAGE})`,
                        maskSize: '100% 100%',
                        WebkitMaskSize: '100% 100%',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                    }}
                />

                <Nav />

                <div className="pointer-events-none absolute top-[14%] right-0 left-0 z-50 flex flex-col items-center px-5 text-center">
                    <h1 className="m-0 leading-[0.95] text-white">
                        <span
                            className="font-playfair hero-anim hero-reveal block text-5xl font-normal italic sm:text-7xl md:text-8xl"
                            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
                        >
                            Layers hold
                        </span>
                        <span
                            className="hero-anim hero-reveal -mt-1 block text-5xl font-normal sm:text-7xl md:text-8xl"
                            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
                        >
                            tales of time
                        </span>
                    </h1>
                </div>

                <div
                    className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[260px] sm:block md:left-14"
                    style={{ animationDelay: '0.7s' }}
                >
                    <p className="m-0 text-sm leading-relaxed text-white/80">
                        Every layer of sediment records a chapter of our planet, from ancient seabeds
                        to drifting ash, layered across millions of years beneath us.
                    </p>
                </div>

                <div
                    className="hero-anim hero-fade absolute bottom-10 right-5 left-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:right-10 sm:left-auto sm:max-w-[260px] sm:gap-5 md:right-14"
                    style={{ animationDelay: '0.85s' }}
                >
                    <p className="m-0 text-xs leading-relaxed text-white/80 sm:text-sm">
                        Our interactive maps let you peel back the crust to trace how stones,
                        fossils, and deep time combine to shape the ground beneath your feet.
                    </p>
                    <button
                        type="button"
                        className="cursor-pointer rounded-full border-none bg-lithos-clay px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-lithos-clay-dark hover:shadow-lg hover:shadow-lithos-clay/30 active:scale-95"
                    >
                        Start Digging
                    </button>
                </div>
            </section>
        </PageFrame>
    );
}
