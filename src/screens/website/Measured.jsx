import React, { useEffect, useRef, useState } from 'react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';

/**
 * Measured — single-viewport hero for a wellness wearable.
 *
 * Five stacked layers: a parallax grid, a still product shot, the wordmark, a
 * haze PNG, and a cursor-tracked spotlight that masks a video in. Nothing
 * scrolls; all of the motion comes from the pointer.
 */

const BG_IMAGE_1 = '/assets/measured/background.webp';
const FRONT_VIDEO = '/assets/measured/front.mp4';
const OVERLAY_IMAGE = '/assets/measured/overlay.png';

const NAV_ITEMS = ['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us'];

const SPOTLIGHT_RADIUS = 260;

/**
 * The mask canvas renders at a quarter of the viewport and is stretched back to
 * full size. It only ever holds a smooth radial gradient, so the downsample is
 * invisible — and it keeps the per-frame `toDataURL` encode small enough to
 * stay off the frame budget.
 */
const MASK_SCALE = 0.25;

/** Feathered falloff: solid to 40%, then four stops out to fully transparent. */
const MASK_STOPS = [
    [0, 1],
    [0.4, 1],
    [0.6, 0.75],
    [0.75, 0.4],
    [0.88, 0.12],
    [1, 0],
];

const MENU_EASE = 'cubic-bezier(0.77, 0, 0.18, 1)';

function Logo() {
    return (
        <svg viewBox="0 0 256 256" width="28" height="28" fill="#fff" aria-hidden="true">
            <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
        </svg>
    );
}

function GreenDot() {
    return <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" />;
}

/* -------------------------------------------------------------------------- */

function MobileMenu({ onClose }) {
    // Flipped on after mount so the staggered transitions have a frame to run from.
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setShown(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const entry = (delay, extra = '') => ({
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : `translateY(24px) ${extra}`,
        transition: `opacity 0.6s ${MENU_EASE} ${delay}ms, transform 0.6s ${MENU_EASE} ${delay}ms`,
    });

    return (
        <div className="fixed inset-0 z-[55] flex flex-col bg-[#0a0a0a] md:hidden">
            <div className="flex justify-end p-5">
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={onClose}
                    className="liquid-glass flex h-11 w-11 cursor-pointer items-center justify-center rounded-full"
                    style={{
                        opacity: shown ? 1 : 0,
                        transform: shown ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.8)',
                        transition: `opacity 0.5s ${MENU_EASE}, transform 0.5s ${MENU_EASE}`,
                    }}
                >
                    <span className="relative block h-4 w-4">
                        <span className="absolute top-1/2 left-0 h-[1.5px] w-4 rotate-45 bg-white" />
                        <span className="absolute top-1/2 left-0 h-[1.5px] w-4 -rotate-45 bg-white" />
                    </span>
                </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-6">
                {NAV_ITEMS.map((item, i) => (
                    <button
                        key={item}
                        type="button"
                        className="cursor-pointer border-none bg-transparent text-3xl font-medium text-white/90 sm:text-4xl"
                        style={entry(100 + i * 60)}
                    >
                        {item}
                    </button>
                ))}
            </nav>

            <div className="flex justify-center pb-16" style={entry(100 + NAV_ITEMS.length * 60)}>
                <button
                    type="button"
                    className="liquid-glass flex cursor-pointer items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                >
                    <GreenDot />
                    Reserve Yours
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    const sectionRef = useRef(null);
    const gridRef = useRef(null);
    const revealRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const grid = gridRef.current;
        const reveal = revealRef.current;
        const canvas = canvasRef.current;
        if (!section || !grid || !reveal || !canvas) return undefined;

        const ctx = canvas.getContext('2d');
        let frame = 0;
        let entered = false;

        // Targets track the pointer; the smoothed pair chases them at 0.1/0.06
        // per frame, which is what turns a jumpy pointer into a drifting light.
        const target = { x: -1, y: -1 };
        const smooth = { x: -1, y: -1 };
        const gridTarget = { x: 0, y: 0 };
        const gridSmooth = { x: 0, y: 0 };
        let lastDrawn = { x: NaN, y: NaN };

        const resize = () => {
            const { width, height } = section.getBoundingClientRect();
            canvas.width = Math.max(1, Math.round(width * MASK_SCALE));
            canvas.height = Math.max(1, Math.round(height * MASK_SCALE));
            lastDrawn = { x: NaN, y: NaN };
        };
        resize();

        const drawMask = (x, y) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createRadialGradient(
                x * MASK_SCALE,
                y * MASK_SCALE,
                0,
                x * MASK_SCALE,
                y * MASK_SCALE,
                SPOTLIGHT_RADIUS * MASK_SCALE
            );
            for (const [stop, alpha] of MASK_STOPS) {
                gradient.addColorStop(stop, `rgba(255, 255, 255, ${alpha})`);
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const url = `url(${canvas.toDataURL()})`;
            reveal.style.webkitMaskImage = url;
            reveal.style.maskImage = url;
        };

        const onMove = event => {
            const rect = section.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            target.x = x;
            target.y = y;
            gridTarget.x = (x / rect.width - 0.5) * 16;
            gridTarget.y = (y / rect.height - 0.5) * 16;

            if (!entered) {
                entered = true;
                smooth.x = x;
                smooth.y = y;
                reveal.style.opacity = '1';
            }
        };

        const tick = () => {
            if (entered) {
                smooth.x += (target.x - smooth.x) * 0.1;
                smooth.y += (target.y - smooth.y) * 0.1;

                // Re-encoding an identical gradient costs a frame for nothing.
                if (
                    Math.abs(smooth.x - lastDrawn.x) > 0.5 ||
                    Math.abs(smooth.y - lastDrawn.y) > 0.5 ||
                    Number.isNaN(lastDrawn.x)
                ) {
                    drawMask(smooth.x, smooth.y);
                    lastDrawn = { x: smooth.x, y: smooth.y };
                }
            }

            gridSmooth.x += (gridTarget.x - gridSmooth.x) * 0.06;
            gridSmooth.y += (gridTarget.y - gridSmooth.y) * 0.06;
            grid.style.transform = `translate3d(${gridSmooth.x}px, ${gridSmooth.y}px, 0)`;

            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="font-helvetica-neue relative h-screen w-full overflow-hidden bg-[#0a0a0a]"
        >
            {/* Layer 1 — parallax grid */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
                <div ref={gridRef} className="absolute -inset-8" style={{ willChange: 'transform' }}>
                    <svg width="100%" height="100%" aria-hidden="true">
                        <defs>
                            <pattern
                                id="measured-grid"
                                width="48"
                                height="48"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 48 0 L 0 0 0 48"
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth="0.6"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#measured-grid)" />
                    </svg>
                </div>
            </div>

            {/* Layer 2 — product still */}
            <div
                className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
            />

            {/* Layer 3 — wordmark */}
            <h1
                className="absolute inset-x-0 top-20 z-20 m-0 text-center text-[4.5rem] leading-[0.9] text-white uppercase xs:text-[5.5rem] sm:top-28 sm:text-[10rem] md:top-32 md:text-[13rem] lg:text-[16rem]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
            >
                Measured
            </h1>

            {/* Layer 4 — atmosphere */}
            <img
                src={OVERLAY_IMAGE}
                alt=""
                className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover"
            />

            {/* Layer 5 — spotlight reveal. Starts hidden; the first pointer move
                paints a mask and fades it in. */}
            <div
                ref={revealRef}
                className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-500"
                style={{
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                }}
            >
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={FRONT_VIDEO}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ clipPath: 'inset(40% 0 0 0)' }}
                />
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function Measured() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [menuOpen]);

    return (
        <PageFrame
            title="Measured — Health, Quantified"
            scroll={false}
            className="type-inter bg-white"
        >
            <BackButton />

            <div className="fixed top-5 left-5 z-50">
                <Logo />
            </div>

            <div className="fixed top-5 left-1/2 z-50 hidden -translate-x-1/2 md:block">
                <nav className="liquid-glass flex items-center gap-1 rounded-full px-2 py-2">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item}
                            type="button"
                            className="cursor-pointer rounded-full border-none bg-transparent px-4 py-1.5 text-sm font-medium text-white/70 transition-colors duration-300 hover:text-white"
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="fixed top-5 right-5 z-50 md:hidden">
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setMenuOpen(true)}
                    className="liquid-glass flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full"
                >
                    <span className="h-[1.5px] w-5 bg-white" />
                    <span className="h-[1.5px] w-3.5 bg-white" />
                </button>
            </div>

            <div className="fixed top-5 right-5 z-50 hidden md:block">
                <button
                    type="button"
                    className="liquid-glass flex cursor-pointer items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                >
                    <GreenDot />
                    Reserve Yours
                </button>
            </div>

            <Hero />

            {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
        </PageFrame>
    );
}
