import React from 'react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';

/**
 * Axon — single-viewport hero for a digital-worker platform.
 *
 * One 100vh section: a looping video bled to 130% height and anchored to its
 * top edge, with a glass nav pill and centred hero stack floating over it.
 */

const HERO_VIDEO = '/assets/axon/hero.mp4';

const NAV_LINKS = ['Features', 'Plans', 'Security', 'About'];

function Logo() {
    return (
        <svg
            viewBox="0 0 256 256"
            width="24"
            height="24"
            fill="#1B133C"
            aria-hidden="true"
            className="shrink-0"
        >
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" />
            <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
    );
}

export default function Axon() {
    return (
        <PageFrame
            title="Axon — Digital Workers for Mundane Workflows"
            scroll={false}
            className="type-inter bg-white text-[#1B133C]"
        >
            <BackButton />

            <section className="relative flex h-screen w-full flex-col overflow-hidden">
                {/* Bled to 130% height and top-anchored, so the framing holds as the
                    viewport gets shorter instead of drifting to the middle of the shot. */}
                <video
                    className="absolute inset-0 z-0 h-[130%] w-full object-cover object-top"
                    src={HERO_VIDEO}
                    autoPlay
                    muted
                    loop
                    playsInline
                />

                <header className="relative z-10 flex justify-center pt-4 md:pt-6">
                    <nav className="flex items-center gap-6 rounded-xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md md:px-6">
                        <Logo />
                        <div className="hidden items-center gap-6 sm:flex">
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-sm font-medium text-[#1B133C]/80 no-underline transition-colors duration-300 hover:text-[#1B133C]"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </nav>
                </header>

                <div className="relative z-10 mt-8 flex flex-col items-center px-6 text-center md:mt-16">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#1B133C]/10 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500 text-xs font-bold text-white">
                            Y
                        </span>
                        Funded by Y Combinator
                    </div>

                    <h1 className="font-serif-accent m-0 max-w-4xl text-4xl leading-[0.95] tracking-tight text-[#1B133C] sm:text-5xl md:text-7xl lg:text-8xl">
                        Deploy digital workers
                        <br />
                        for mundane workflows
                    </h1>

                    <p className="mt-5 max-w-3xl text-xs leading-relaxed text-[#1B133C]/70 sm:mt-6 sm:text-sm md:text-base">
                        Eliminate your tedious browser work and 10x your team&apos;s capacity. Put
                        intelligent agents on every routine process so you grow faster and deliver
                        more for clients — effortlessly.
                    </p>

                    <button
                        type="button"
                        className="mt-7 cursor-pointer rounded-xl border-none bg-[#FEFEFE] px-6 py-3 text-sm font-semibold text-[#1B133C] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0px_6px_16px_rgba(0,0,0,0.2)] sm:mt-8 sm:px-8 sm:py-3.5"
                    >
                        Get Early Access
                    </button>
                </div>
            </section>
        </PageFrame>
    );
}
