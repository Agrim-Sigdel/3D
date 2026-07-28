import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Mountain, Search, ShoppingCart, User } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';

/**
 * Wander Gear — an outdoor shop's hero, framed as a rounded card floating on
 * paper. Two techniques carry it.
 *
 * **The video does not fill its box.** It is bottom-anchored at its own size
 * and dissolved into the blue with a radial mask that stays opaque only at the
 * bottom edge, so the footage reads as ground the page is standing on rather
 * than a photo behind a window. `object-cover` would defeat the whole thing by
 * pushing the horizon off-frame. Both `mask-image` and `-webkit-mask-image` are
 * set — WebKit still wants the prefix here.
 *
 * **The corners curve the wrong way.** The Shop Now block is a notch cut out of
 * the card's bottom-right, which means the two places it meets the card's
 * straight edges have to be *concave*. A border radius cannot go that way, so
 * each junction is a 40×40 square filled by a radial gradient that is
 * transparent inside 40px and page-coloured outside it — the inverse of a
 * rounded corner, which is exactly what a cut-out needs.
 *
 * The slug is `wander-gear`, and its palette tokens are prefixed `gear-`,
 * because `wandor` and `--color-wandor-*` are already taken by a different
 * template in this folder. One letter apart in a route or a class name is not a
 * distance worth relying on.
 */

const HERO_VIDEO = '/assets/wander-gear/hero.mp4';

/** Slow enough that the pan reads as weather rather than motion. */
const PLAYBACK_RATE = 0.25;

const PAGE = '#f3efe8';

const NAV_LINKS = [
    'Camping',
    'Hiking',
    'Backpacks',
    'Gear',
    'Footwear',
    'Accessories',
    'Sale',
];

/* Opaque at the bottom edge, gone by the sides and top. */
const VIDEO_MASK = 'radial-gradient(55% 100% at bottom, black 5%, transparent 90%)';

/*
 * The inverse of a rounded corner: nothing inside the 40px arc, page colour
 * outside it. Both junctions want the arc centred on their top-left, so one
 * declaration covers the pair — above the cut-out the page colour has to reach
 * down-right toward the card's edge, and beside it, up-right for the same
 * reason.
 */
const NOTCH_STYLE = {
    backgroundImage: `radial-gradient(circle at 0 0, transparent 40px, ${PAGE} 40px)`,
};

/* -------------------------------------------------------------------------- */

function Nav() {
    return (
        <nav className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between px-8 py-8 lg:px-16">
            <a
                href="#"
                className="text-gear-dark flex items-center gap-2.5 no-underline transition-colors hover:text-orange-500"
            >
                <Mountain size={28} />
                <span className="text-xl font-bold tracking-widest uppercase">Wander</span>
            </a>

            <div className="hidden items-center gap-8 lg:flex">
                {NAV_LINKS.map(link => (
                    <a
                        key={link}
                        href={`#${link.toLowerCase()}`}
                        className={`text-sm no-underline transition-colors hover:text-orange-500 ${
                            link === 'Sale' ? 'text-gear-orange' : 'text-gear-dark/90'
                        }`}
                    >
                        {link}
                    </a>
                ))}
            </div>

            <div className="text-gear-dark flex items-center gap-6">
                <button
                    type="button"
                    aria-label="Search"
                    className="cursor-pointer border-none bg-transparent p-0 text-inherit transition-colors hover:text-orange-500"
                >
                    <Search size={20} />
                </button>
                <button
                    type="button"
                    aria-label="Account"
                    className="cursor-pointer border-none bg-transparent p-0 text-inherit transition-colors hover:text-orange-500"
                >
                    <User size={20} />
                </button>
                <button
                    type="button"
                    aria-label="Cart, 2 items"
                    className="relative cursor-pointer border-none bg-transparent p-0 text-inherit transition-colors hover:text-orange-500"
                >
                    <ShoppingCart size={20} />
                    <span className="bg-gear-orange absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                        2
                    </span>
                </button>
            </div>
        </nav>
    );
}

/* -------------------------------------------------------------------------- */

function ShopNowCutout() {
    return (
        <div
            className="absolute right-0 bottom-0 z-30 flex items-center gap-5 rounded-tl-[40px] pt-8 pr-10 pb-8 pl-10"
            style={{ background: PAGE }}
        >
            {/* Top junction: the cut-out's own top edge meeting the card. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 bottom-full h-10 w-10"
                style={NOTCH_STYLE}
            />
            {/* Left junction, where it meets the card's bottom edge. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-full bottom-0 h-10 w-10"
                style={NOTCH_STYLE}
            />

            <div className="text-gear-dark">
                <p className="m-0 text-lg font-medium">Shop Now</p>
                <p className="m-0 text-sm opacity-60">Explore category ›</p>
            </div>

            <button
                type="button"
                aria-label="Shop now"
                className="text-gear-dark flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-black/5 transition-colors hover:bg-black/10"
            >
                <ArrowUpRight size={20} />
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

export default function WanderGear() {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) video.playbackRate = PLAYBACK_RATE;
    }, []);

    return (
        <PageFrame title="Wander — Gear for Every Journey" className="type-inter bg-gear-bg">
            <BackButton fixed top={110} left={44} />

            <div className="flex min-h-full flex-col items-center p-4 md:p-6">
                <div className="w-full max-w-[1600px]">
                    <section className="bg-gear-blue relative h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] shadow-sm ring-1 ring-black/5 md:h-[calc(100vh-3rem)] md:rounded-[40px]">
                        <video
                            ref={videoRef}
                            src={HERO_VIDEO}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            className="pointer-events-none absolute bottom-0 left-1/2 w-full max-w-none -translate-x-1/2 md:w-auto"
                            style={{ maskImage: VIDEO_MASK, WebkitMaskImage: VIDEO_MASK }}
                        />

                        <Nav />

                        <div className="relative flex h-full items-center justify-center px-8">
                            <div className="-mt-22 flex max-w-3xl flex-col items-center text-center">
                                <p className="text-gear-dark m-0 text-sm font-bold tracking-widest uppercase">
                                    Gear for every journey
                                </p>

                                <h1 className="font-outfit text-gear-dark m-0 mt-6 text-4xl leading-[1.05] font-medium tracking-tight md:text-5xl lg:text-6xl">
                                    Everything you need
                                    <br />
                                    to keep going.
                                </h1>

                                <p className="text-gear-text/90 m-0 mt-6 max-w-md text-lg md:text-xl">
                                    Packs, boots and layers built for long days and worse weather —
                                    tested on the routes we actually walk.
                                </p>

                                <a
                                    href="#gear"
                                    className="border-gear-dark text-gear-dark hover:bg-gear-dark mt-10 inline-flex items-center justify-center border-2 bg-transparent px-8 py-3.5 text-sm font-medium tracking-wide uppercase no-underline transition-colors hover:text-white"
                                >
                                    Explore Category
                                </a>
                            </div>
                        </div>

                        <ShopNowCutout />
                    </section>
                </div>
            </div>
        </PageFrame>
    );
}
