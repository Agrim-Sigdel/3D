import React, { useState } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import FadingVideo from './FadingVideo.jsx';
import { Instagram, Twitter } from './BrandIcons.jsx';

/**
 * The Asme hero — glass nav pill, centred serif headline, newsletter capture,
 * social row — shared by the `asme` and `know-it-all` templates.
 *
 * Those two specs describe the same screen twice and differ only in the
 * headline, the type scale and how the video is framed, so the shell lives here
 * once. `asme` ends at this hero; `know-it-all` stacks four scroll sections
 * underneath it.
 */

const NAV_LINKS = ['Features', 'Pricing', 'About'];

const SOCIALS = [
    { label: 'Instagram', Icon: Instagram },
    { label: 'Twitter', Icon: Twitter },
    { label: 'Website', Icon: Globe },
];

export default function GlassHero({ video, videoClassName, heading, headingClassName }) {
    const [email, setEmail] = useState('');

    return (
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-black">
            <FadingVideo src={video} className={videoClassName} />

            <nav className="relative z-20 px-6 py-6">
                <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3">
                    <div className="flex items-center">
                        <div className="flex items-center gap-2">
                            <Globe size={24} className="text-white" />
                            <span className="text-lg font-semibold text-white">Asme</span>
                        </div>

                        <div className="ml-8 hidden items-center gap-8 md:flex">
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-sm font-medium text-white/80 no-underline transition-colors hover:text-white"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="cursor-pointer border-none bg-transparent p-0 text-sm font-medium text-white"
                        >
                            Sign Up
                        </button>
                        <button
                            type="button"
                            className="liquid-glass cursor-pointer rounded-full px-6 py-2 text-sm font-medium text-white"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 flex flex-1 -translate-y-[20%] flex-col items-center justify-center px-6 py-12 text-center">
                <h1 className={headingClassName}>{heading}</h1>

                <div className="w-full max-w-xl space-y-4">
                    {/* Nothing is posted anywhere — the field is local state, and
                     * the submit handler exists only to stop the page reloading. */}
                    <form
                        onSubmit={event => event.preventDefault()}
                        className="liquid-glass flex items-center gap-3 rounded-full py-2 pr-2 pl-6"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            aria-label="Email address"
                            className="min-w-0 flex-1 border-none bg-transparent text-base text-white outline-none placeholder:text-white/40"
                        />
                        <button
                            type="submit"
                            aria-label="Subscribe"
                            className="flex cursor-pointer items-center justify-center rounded-full border-none bg-white p-3 text-black"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <p className="m-0 px-4 text-sm leading-relaxed text-white">
                        Stay updated with the latest news and insights. Subscribe to our newsletter
                        today and never miss out on exciting updates.
                    </p>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            className="liquid-glass cursor-pointer rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                        >
                            Manifesto
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex justify-center gap-4 pb-12">
                {SOCIALS.map(({ label, Icon }) => (
                    <button
                        key={label}
                        type="button"
                        aria-label={label}
                        className="liquid-glass cursor-pointer rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
                    >
                        <Icon size={20} />
                    </button>
                ))}
            </div>
        </section>
    );
}
