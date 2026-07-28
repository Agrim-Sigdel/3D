import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';

/**
 * Wandor — travel-planning hero built around a liquid-glass prompt card.
 *
 * The glass is four properties working together: a 6%-opacity white fill, a
 * thick opaque white border, a 20px backdrop blur and a 44px radius. Over a
 * moving video that reads as refraction; over a flat colour it would read as
 * nothing, which is why the card only ever sits on the footage.
 */

/*
 * The file this was downloaded as is HEVC Main 10 at 4K, which only Safari
 * reliably decodes — Chrome and Firefox report readyState 4 off the container
 * and then paint nothing, so the card ended up white-on-white. This is the
 * 1080p H.264 transcode, and it is now the only encode that ships.
 *
 * The 4K HEVC used to ride along as a first `<source>` so Safari could take it.
 * That was 16.4 MB to hand one browser a resolution the layout never asks for —
 * this element is 1440×900 at most — while Safari plays High-profile H.264 1080p
 * perfectly well. One source, every browser.
 */
const HERO_VIDEO = '/assets/wandor/hero.mp4';

const NAV_LINKS = ['Discover', 'Pricing', 'FAQs'];

function NavButton({ children }) {
    return (
        <button
            type="button"
            className="cursor-pointer border-none bg-transparent font-sans text-[15px] font-medium tracking-[0.04em] text-wandor-text uppercase transition-opacity hover:opacity-55"
        >
            {children}
        </button>
    );
}

function Hero() {
    const fileInputRef = useRef(null);

    return (
        <section className="relative min-h-svh w-full overflow-hidden">
            <video
                className="absolute inset-0 z-0 h-full w-full object-cover"
                src={HERO_VIDEO}
                autoPlay
                muted
                loop
                playsInline
            />

            {/* White-to-transparent wash over the top 687px — without it the nav
                and headline sit on whatever the video happens to be showing. */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[687px]"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                }}
            />

            <div className="relative z-[2] mx-auto max-w-[1360px]">
                <nav className="relative flex items-center justify-between px-20 pt-6 pb-4 max-md:px-6 max-md:pt-5">
                    <span className="font-display text-[40px] leading-none text-black select-none max-md:text-[32px]">
                        wandor
                    </span>

                    <div className="absolute left-1/2 flex -translate-x-1/2 gap-8 max-md:hidden">
                        {NAV_LINKS.map(link => (
                            <NavButton key={link}>{link}</NavButton>
                        ))}
                    </div>

                    <div className="flex items-center gap-8">
                        <button
                            type="button"
                            className="cursor-pointer border-none bg-transparent font-sans text-[15px] font-semibold tracking-[0.04em] text-[#292929] uppercase transition-opacity hover:opacity-55 max-md:hidden"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className="cursor-pointer rounded-full border-none bg-wandor-dark px-5 py-3.5 font-sans text-[15px] font-medium tracking-[0.04em] text-[#fafafa] uppercase transition-all hover:bg-[#333] active:scale-95"
                        >
                            Plan My Trip
                        </button>
                    </div>
                </nav>

                <div className="flex flex-col items-center px-6 pt-16 pb-24 text-center">
                    <h1 className="mb-5 max-w-[820px] font-sans text-[clamp(40px,6vw,68px)] leading-[1.05] font-medium tracking-[-0.04em] text-wandor-text">
                        Where will you go next?
                    </h1>

                    <p className="mb-10 max-w-[500px] font-sans text-xl leading-relaxed font-medium text-wandor-muted">
                        Tell our AI where you&apos;re going and what you love. We&apos;ll create a
                        personalized itinerary for you.
                    </p>

                    <div className="relative min-h-[208px] w-[701px] overflow-hidden rounded-[44px] border-[3px] border-white bg-white/[0.06] shadow-[0_0_4px_0_rgba(0,0,0,0.15)] backdrop-blur-[20px] max-md:w-[calc(100vw-48px)]">
                        <p className="absolute top-[57px] left-[29px] w-[609px] -translate-y-1/2 font-sans text-xl leading-relaxed font-medium break-words text-wandor-prompt max-md:w-[calc(100%-58px)] max-md:text-[17px]">
                            I&apos;m planning a 7-day trip to Japan in October. I love food, hidden
                            cafes, scenic hikes, and want to avoid crowds....
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                        />

                        <button
                            type="button"
                            aria-label="Upload inspiration"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute top-[137px] left-[21px] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-transparent backdrop-blur-[14px] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <Upload className="h-[18px] w-[18px] shrink-0 text-wandor-text" />
                        </button>

                        <button
                            type="button"
                            className="absolute right-[21px] bottom-[21px] flex h-14 w-[156px] cursor-pointer items-center justify-center rounded-[44px] border-none bg-black font-sans text-base font-medium tracking-[0.02em] text-[#fafafa] uppercase shadow-[0_0_2px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#333] active:scale-95"
                        >
                            Plan My Trip
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Wandor() {
    return (
        <PageFrame
            title="Wandor — Where will you go next?"
            scroll={false}
            className="type-geist bg-white"
        >
            <BackButton />
            <Hero />
        </PageFrame>
    );
}
