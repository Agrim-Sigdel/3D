import React from 'react';
import { Mail } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import { Github, Twitter } from './shared/BrandIcons.jsx';

/**
 * Orbis.Nft — four sections on deep navy, three of them carrying video.
 *
 * The type system is the whole identity: Anton, uppercase, for every heading and
 * link; a monospace stack for body copy; and Condiment — a cursive — for accent
 * words laid over the headings in neon green under `mix-blend-exclusion`, which
 * inverts them against whatever is behind rather than tinting it.
 *
 * A grain plate sits above everything at z-50 under `mix-blend-lighten`. The
 * brief names a `/texture.png` without supplying one, so it is generated:
 * 1024², sparse, mean luma ~12, which lifts the navy just enough to read as film
 * rather than washing it out.
 */

const HERO_VIDEO = '/assets/orbis/hero.mp4';
const ABOUT_VIDEO = '/assets/orbis/about.mp4';
const CTA_VIDEO = '/assets/orbis/cta.mp4';
const TEXTURE = '/assets/orbis/texture.png';

const NAV_LINKS = ['Homepage', 'Gallery', 'Buy NFT', 'FAQ', 'Contact'];

const SOCIALS = [
    { label: 'Email', Icon: Mail },
    { label: 'Twitter', Icon: Twitter },
    { label: 'GitHub', Icon: Github },
];

const NFTS = [
    { video: '/assets/orbis/nft-1.mp4', score: '8.7/10' },
    { video: '/assets/orbis/nft-2.mp4', score: '9/10' },
    { video: '/assets/orbis/nft-3.mp4', score: '8.2/10' },
];

const ABOUT_COPY =
    'A digital object fixed beyond time and place. An exploration of distance, form, and silence in space';

const CTA_LINES = ["REVEAL WHAT'S HIDDEN.", "DEFINE WHAT'S NEXT.", 'FOLLOW THE SIGNAL.'];

/** Every section shares one measure and one gutter. */
const SHELL = 'mx-auto w-full max-w-[1831px] px-5 sm:px-8 lg:px-12';

/* -------------------------------------------------------------------------- */

function BackgroundVideo({ src }) {
    return (
        <video
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            autoPlay
            loop
            muted
            playsInline
        />
    );
}

/** Cursive neon, inverted against its backdrop rather than blended into it. */
function Cursive({ className = '', children }) {
    return (
        <span
            className={`font-condiment text-orbis-neon opacity-90 mix-blend-exclusion ${className}`}
        >
            {children}
        </span>
    );
}

function SocialButton({ label, Icon }) {
    return (
        <button
            type="button"
            aria-label={label}
            className="liquid-glass flex h-14 w-14 cursor-pointer items-center justify-center rounded-[1rem] text-orbis-cream transition-colors hover:bg-white/10"
        >
            <Icon size={20} />
        </button>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    return (
        <section className="relative min-h-screen overflow-hidden rounded-b-[32px]">
            <BackgroundVideo src={HERO_VIDEO} />

            <div className={`${SHELL} relative z-10 flex min-h-screen flex-col py-6`}>
                <header className="flex items-start justify-between gap-6">
                    <span className="font-anton text-[16px] tracking-wide text-orbis-cream uppercase">
                        Orbis.Nft
                    </span>

                    <nav className="liquid-glass hidden rounded-[28px] px-[52px] py-[24px] lg:block">
                        <ul className="m-0 flex list-none items-center gap-10 p-0">
                            {NAV_LINKS.map(link => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="font-anton text-[13px] text-orbis-cream no-underline uppercase transition-colors hover:text-orbis-neon"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="hidden flex-col gap-3 lg:flex">
                        {SOCIALS.map(social => (
                            <SocialButton key={social.label} {...social} />
                        ))}
                    </div>
                </header>

                <div className="flex flex-1 flex-col justify-center py-16">
                    <div className="relative lg:ml-32">
                        <h1 className="font-anton m-0 max-w-[780px] text-[40px] leading-[1.05] text-orbis-cream uppercase sm:text-[60px] sm:leading-[1] md:text-[75px] lg:text-[90px]">
                            Beyond earth
                            <br />
                            and ( its ) familiar boundaries
                        </h1>

                        <Cursive className="absolute -top-6 right-0 -rotate-1 text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px]">
                            Nft collection
                        </Cursive>
                    </div>

                    <div className="mt-10 flex justify-center gap-3 lg:hidden">
                        {SOCIALS.map(social => (
                            <SocialButton key={social.label} {...social} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function About() {
    return (
        <section className="relative min-h-screen overflow-hidden">
            <BackgroundVideo src={ABOUT_VIDEO} />

            <div
                className={`${SHELL} relative z-10 flex min-h-screen flex-col justify-between py-16 sm:py-20 lg:py-24`}
            >
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                    <div className="relative">
                        <h2 className="font-anton m-0 text-[32px] leading-[1.05] text-orbis-cream uppercase sm:text-[44px] md:text-[52px] lg:text-[60px]">
                            Hello!
                            <br />
                            I&apos;m orbis
                        </h2>
                        <Cursive className="absolute -right-8 -bottom-4 rotate-2 text-[36px] sm:text-[48px] md:text-[58px] lg:text-[68px]">
                            Orbis
                        </Cursive>
                    </div>

                    <p className="m-0 max-w-[266px] font-mono text-[14px] leading-relaxed text-orbis-cream uppercase sm:text-[16px]">
                        {ABOUT_COPY}
                    </p>
                </div>

                {/*
                 * Decorative repeats of the same sentence, all but invisible. On
                 * mobile they take the page's own navy so they vanish completely
                 * against the video rather than sitting on it as grey haze.
                 */}
                <div className="mt-16 flex items-start justify-between gap-10">
                    <div className="flex flex-col gap-6">
                        {[0, 1].map(i => (
                            <p
                                key={i}
                                aria-hidden="true"
                                className="m-0 max-w-[266px] font-mono text-[14px] leading-relaxed text-[#010828] uppercase sm:text-[16px] lg:text-orbis-cream lg:opacity-10"
                            >
                                {ABOUT_COPY}
                            </p>
                        ))}
                    </div>

                    <div className="hidden flex-col gap-6 lg:flex">
                        {[0, 1].map(i => (
                            <p
                                key={i}
                                aria-hidden="true"
                                className="m-0 max-w-[266px] font-mono text-[16px] leading-relaxed text-orbis-cream uppercase opacity-10"
                            >
                                {ABOUT_COPY}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Collection() {
    return (
        <section className="bg-orbis-ink py-16 sm:py-20 lg:py-24">
            <div className={SHELL}>
                <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="font-anton m-0 text-[32px] leading-[1.05] text-orbis-cream uppercase sm:text-[44px] md:text-[52px] lg:text-[60px]">
                        Collection of
                        <br />
                        <span className="ml-12 md:ml-24 lg:ml-32">
                            <Cursive>Space</Cursive> objects
                        </span>
                    </h2>

                    <button
                        type="button"
                        className="w-fit cursor-pointer border-none bg-transparent p-0 text-left"
                    >
                        <span className="flex items-center gap-3">
                            <span className="font-anton text-[32px] leading-none text-orbis-cream uppercase sm:text-[44px] md:text-[52px] lg:text-[60px]">
                                See
                            </span>
                            <span className="font-anton flex flex-col text-[20px] leading-[1.05] text-orbis-cream uppercase sm:text-[26px] md:text-[32px] lg:text-[36px]">
                                <span>All</span>
                                <span>Creators</span>
                            </span>
                        </span>
                        <span className="mt-3 block h-[6px] w-full bg-orbis-neon lg:h-[10px]" />
                    </button>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {NFTS.map(nft => (
                        <div
                            key={nft.video}
                            className="liquid-glass rounded-[32px] p-[18px] transition-colors hover:bg-white/10"
                        >
                            {/* Padding-bottom of 100% is the square: it resolves
                             * against the box's own width, which a percentage
                             * height would not. */}
                            <div className="relative overflow-hidden rounded-[24px] pb-[100%]">
                                <video
                                    className="absolute inset-0 h-full w-full object-cover"
                                    src={nft.video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />

                                <div className="liquid-glass absolute right-4 bottom-4 left-4 flex items-center justify-between gap-4 rounded-[20px] px-5 py-4">
                                    <span>
                                        <span className="block font-mono text-[11px] text-orbis-cream/70 uppercase">
                                            Rarity score:
                                        </span>
                                        <span className="font-anton block text-[16px] text-orbis-cream uppercase">
                                            {nft.score}
                                        </span>
                                    </span>

                                    <span
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] shadow-lg shadow-purple-500/50 transition-transform hover:scale-110"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#ffffff"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Cta() {
    return (
        <section className="relative bg-orbis-ink">
            {/* Native aspect ratio, not a cover crop — this clip is composed to be
             * seen whole, and the copy is placed into its empty right side. */}
            <video
                className="block h-auto w-full"
                src={CTA_VIDEO}
                autoPlay
                loop
                muted
                playsInline
            />

            <div className="absolute inset-0 flex items-center justify-end px-5 sm:px-8 lg:pr-[20%] lg:pl-[15%]">
                <div className="relative text-right">
                    <Cursive className="absolute -top-8 left-0 -rotate-2 text-[17px] sm:text-[32px] md:text-[48px] lg:text-[68px]">
                        Go beyond
                    </Cursive>

                    <h2 className="font-anton m-0 text-[16px] leading-[1.1] text-orbis-cream uppercase sm:text-[28px] md:text-[44px] lg:text-[60px]">
                        <span className="mb-4 block sm:mb-8 lg:mb-12">Join us.</span>
                        {CTA_LINES.map(line => (
                            <span key={line} className="block">
                                {line}
                            </span>
                        ))}
                    </h2>
                </div>
            </div>

            <div className="absolute bottom-[12%] left-[8%] sm:bottom-[16%] lg:bottom-[20%]">
                <div className="liquid-glass flex flex-col overflow-hidden rounded-[0.5rem] lg:rounded-[1.25rem]">
                    {SOCIALS.map((social, i) => (
                        <button
                            key={social.label}
                            type="button"
                            aria-label={social.label}
                            className={`flex h-[14vw] w-[14vw] cursor-pointer items-center justify-center border-none bg-transparent text-orbis-cream transition-colors hover:bg-white/10 sm:h-20 sm:w-[14.375rem] md:h-16 md:w-[10.78125rem] lg:h-24 lg:w-[16.77rem] ${
                                i < SOCIALS.length - 1 ? 'border-b border-white/10' : ''
                            }`}
                        >
                            <social.Icon size={20} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

export default function Orbis() {
    return (
        <PageFrame title="Orbis.Nft — Beyond Earth" className="bg-orbis-ink">
            <BackButton fixed top={64} left={20} />

            <Hero />
            <About />
            <Collection />
            <Cta />

            {/* Above every section, below the back control (z-1000). */}
            <div
                className="pointer-events-none fixed inset-0 z-50 mix-blend-lighten"
                style={{
                    backgroundImage: `url(${TEXTURE})`,
                    backgroundSize: 'cover',
                    opacity: 0.6,
                }}
                aria-hidden="true"
            />
        </PageFrame>
    );
}
