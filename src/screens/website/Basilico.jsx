import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Clock, Mail, MapPin, Menu, Phone, Quote, X } from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import FadeIn from './shared/FadeIn.jsx';
import Select from './shared/Select.jsx';
import DateField from './shared/DateField.jsx';
import { useScrollFrame } from './shared/frameContext.js';

/**
 * Basilico — a fine-dining site in ten sections: black, gold, Playfair, and a
 * boxed 1280px column so it reads as a plate rather than a page.
 *
 * Four things the brief specifies that this repo has to answer differently.
 *
 * **Scroll reveals are `whileInView`, not ScrollTrigger.** These templates are
 * `position: fixed`, so the scrolling element is `PageFrame`'s, not the
 * document's; ScrollTrigger would need its `scroller` rewired for every trigger
 * on the page. Framer Motion's viewport detection is an IntersectionObserver
 * against the viewport, which the frame fills exactly, so it is correct here
 * with no configuration. GSAP is kept for the two things that are *not*
 * scroll-driven: the hero's load timeline and the video card's float.
 *
 * **The modal locks the frame, not the body.** `document.body.style.overflow`
 * is the standard move and does nothing at all in this library — the body has
 * no scroll to lock. `PageFrame` already owns the element that does, and takes
 * a `scroll` prop, so the lock is `scroll={!menuOpen}` and stays declarative.
 *
 * **Lenis is not installed.** It would also need pointing at the frame rather
 * than the window, and it is a dependency for one screen; the section reveals
 * carry the pacing instead.
 *
 * **The gallery images are generated.** §3.9 asks for a dense editorial grid
 * and names no sources, so the six stills are single frames cut from this
 * template's own hero clip — the same approach `michael/stills` already uses in
 * this folder. The four dish photographs are the exact URLs the brief pins.
 */

const HERO_IMAGE = '/assets/basilico/hero.png';
const HERO_VIDEO = '/assets/basilico/hero-food.mp4';
const GALLERY = [1, 2, 3, 4, 5, 6].map(n => `/assets/basilico/stills/${n}.webp`);

const NAV_LINKS = ['Menu', 'About', 'Experience', 'Reservations'];

const DISHES = [
    {
        name: 'Truffle Wagyu Ribeye',
        price: '145',
        body: 'A5 ribeye, black winter truffle, bone marrow jus.',
        image: '/assets/basilico/dishes/1.jpg',
    },
    {
        name: 'Hand-Dived Scallop',
        price: '62',
        body: 'Brown butter, apple, and a little sea lettuce.',
        image: '/assets/basilico/dishes/2.jpg',
    },
    {
        name: 'Aged Duck & Cherry',
        price: '88',
        body: 'Dry-aged eighteen days, beetroot, sour cherry.',
        image: '/assets/basilico/dishes/3.jpg',
    },
    {
        name: 'Saffron Risotto Nero',
        price: '54',
        body: 'Carnaroli, squid ink, Sardinian saffron, lemon.',
        image: '/assets/basilico/dishes/4.jpg',
    },
];

const FULL_MENU = [
    {
        category: 'Starters',
        items: [
            ['Oyster, Champagne Mignonette', '28'],
            ['Hand-Dived Scallop, Brown Butter', '62'],
            ['Heritage Beet Carpaccio', '24'],
            ['Foie Gras, Quince, Brioche', '38'],
        ],
    },
    {
        category: 'Mains',
        items: [
            ['Truffle Wagyu Ribeye', '145'],
            ['Aged Duck, Cherry & Beet', '88'],
            ['Turbot, Vin Jaune, Girolles', '76'],
            ['Saffron Risotto Nero', '54'],
        ],
    },
    {
        category: 'Desserts',
        items: [
            ['Valrhona Soufflé, Bitter Orange', '22'],
            ['Tarte Tatin, for Two', '34'],
            ['Aged Comté & Honeycomb', '26'],
        ],
    },
];

const TASTING = [
    {
        title: 'Seven Courses',
        lead: '195 per guest',
        lines: [
            'I — Oyster, cucumber, dill oil',
            'II — Beetroot, aged goat, walnut',
            'III — Scallop, brown butter, apple',
            'IV — Turbot, vin jaune, girolles',
            'V — Wagyu, truffle, marrow',
            'VI — Comté, honeycomb, pear',
            'VII — Soufflé, bitter orange',
        ],
    },
    {
        title: 'The Pairing',
        lead: '120 per guest',
        lines: [
            'Seven glasses, poured to the course',
            'Grower Champagne to open',
            'Jura and Burgundy through the middle',
            'A fortified Rivesaltes to close',
            'Non-alcoholic pairing at the same price',
        ],
    },
    {
        title: 'The Table',
        lead: 'Six seats a night',
        lines: [
            'Served at the kitchen counter',
            'Three hours, one sitting',
            'Wednesday through Saturday',
            'Dietary requirements with 72 hours notice',
            'Booked through the form below',
        ],
    },
];

const TESTIMONIALS = [
    {
        quote: 'Thorne cooks like someone who has nothing left to prove and keeps proving it anyway. The seventh course arrived and the room went quiet.',
        name: 'Elena Marchetti',
        title: 'La Cucina Review',
    },
    {
        quote: 'A tasting menu that argues for itself. Three hours passed and I could not tell you where the second one went.',
        name: 'Daniel Okonjo',
        title: 'The Continental',
    },
    {
        quote: 'The wine list is longer than the menu and every pour is a sentence in the same paragraph. Faultless service, no theatre.',
        name: 'Marguerite Vance',
        title: 'Guide Vermillion',
    },
];

const EXPERIENCES = [
    { title: 'The Dining Room', body: 'Twenty-eight covers under low brass light, and no music louder than the room.' },
    { title: 'Private Dining', body: 'A twelve-seat table behind the cellar door, with its own service and its own menu.' },
    { title: 'The Wine Cellar', body: 'Nine hundred labels, weighted toward Jura, Piedmont and the older end of Burgundy.' },
];

const CONTACT = [
    { Icon: MapPin, lines: ['41 Fettercairn Lane', 'London EC2A 4RR'] },
    { Icon: Phone, lines: ['+44 20 7946 0812'] },
    { Icon: Clock, lines: ['Wed–Sat, 18:00 – 23:00', 'One sitting a night'] },
];

const GUEST_OPTIONS = ['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests'];
const TIME_OPTIONS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

const YEAR = new Date().getFullYear();

/** Shared field chrome. */
const FIELD_CLASS =
    'w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3.5 text-sm text-white ' +
    'outline-none transition-colors focus:border-basilico-gold/60';

/* Popover tint for `./shared/Select` and `./shared/DateField`. */
const MENU_CLASS = 'border-white/10 bg-[#121212]/95';

/* -------------------------------------------------------------------------- */

/**
 * A dot that trails the pointer and swells over anything clickable.
 *
 * Position is written to motion values, so the pointer moving costs no React
 * render at all. The swell *is* state, but `pointerover` fires on element
 * boundaries rather than on every pixel of movement, so it changes rarely.
 * Mounted only for fine pointers — on touch there is no cursor to replace.
 */
function CustomCursor() {
    /* Read once as the initial value rather than set from an effect: the query
     * is a pure read of the environment and cannot change under this mount. */
    const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches);
    const [active, setActive] = useState(false);
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const springX = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 });

    useEffect(() => {
        if (!enabled) return undefined;

        const onMove = event => {
            x.set(event.clientX);
            y.set(event.clientY);
        };
        const onOver = event => {
            const target = event.target;
            setActive(Boolean(target?.closest?.('a, button, input, select, textarea')));
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerover', onOver);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerover', onOver);
        };
    }, [enabled, x, y]);

    if (!enabled) return null;

    return (
        <motion.div
            aria-hidden="true"
            style={{ x: springX, y: springY }}
            className="pointer-events-none fixed top-0 left-0 z-[200] -translate-x-1/2 -translate-y-1/2"
        >
            <motion.span
                animate={{ scale: active ? 2.6 : 1, opacity: active ? 0.6 : 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-basilico-gold block h-2.5 w-2.5 rounded-full"
            />
        </motion.div>
    );
}

/* -------------------------------------------------------------------------- */

function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="bg-basilico-ink/50 sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
                <a href="#" className="font-playfair text-2xl tracking-wide text-white no-underline">
                    Basilico
                </a>

                <nav className="hidden items-center gap-10 md:flex">
                    {NAV_LINKS.map(link => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            className="hover:text-basilico-gold text-basilico-warm text-sm font-light tracking-wide no-underline transition-colors"
                        >
                            {link}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <a
                        href="#reservations"
                        className="border-basilico-gold/60 text-basilico-gold hover:bg-basilico-gold hidden rounded-full border px-6 py-2.5 text-sm font-light tracking-wide no-underline transition-colors hover:text-black sm:inline-block"
                    >
                        Reserve Table
                    </a>
                    <button
                        type="button"
                        onClick={() => setOpen(value => !value)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={open}
                        className="cursor-pointer border-none bg-transparent p-1 text-white md:hidden"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <div
                className={`grid overflow-hidden transition-[grid-template-rows] duration-300 md:hidden ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
            >
                <div className="min-h-0">
                    <div className="flex flex-col gap-1 px-6 pb-5">
                        {NAV_LINKS.map(link => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                onClick={() => setOpen(false)}
                                className="text-basilico-warm rounded-lg px-2 py-3 text-sm font-light no-underline hover:bg-white/5"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

/* -------------------------------------------------------------------------- */

function Hero() {
    const rootRef = useRef(null);

    useEffect(() => {
        const context = gsap.context(() => {
            gsap.timeline({ defaults: { ease: 'power4.out' } }).from('.hero-line', {
                y: 100,
                opacity: 0,
                duration: 1.4,
                stagger: 0.15,
            });

            /* The card is never at rest — a slow six-second breath, which is
             * why it is a yoyo tween rather than a one-shot entrance. */
            gsap.to('.hero-card', {
                y: -18,
                duration: 3,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });
        }, rootRef);

        return () => context.revert();
    }, []);

    return (
        <section ref={rootRef} className="relative overflow-hidden">
            <img
                src={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
            />
            {/* Corners down, left side down further — enough for the headline to
             * sit on, not so much that the room disappears. */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(7_7_7/0.75)_100%)]" />
            <div className="from-basilico-ink/60 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent" />

            <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-14 px-6 py-24 lg:grid-cols-2 lg:py-32">
                <div>
                    <p className="hero-line text-basilico-gold m-0 mb-6 text-xs font-light tracking-[0.35em] uppercase">
                        Est. 2009 — London
                    </p>
                    <h1 className="font-playfair m-0 text-4xl leading-[1.1] font-normal text-white md:text-5xl lg:text-[50px]">
                        <span className="hero-line block">Crafting</span>
                        <span className="hero-line from-basilico-gold to-basilico-orange block bg-gradient-to-r bg-clip-text text-transparent">
                            Exceptional
                        </span>
                        <span className="hero-line block">Culinary Experiences</span>
                    </h1>
                    <p className="hero-line text-basilico-warm m-0 mt-8 max-w-md text-base leading-relaxed font-light">
                        Seven courses, one sitting a night, and a cellar deep enough to argue with.
                        Chef Alexander Thorne has cooked the same menu twice in fifteen years, and
                        regrets it.
                    </p>
                    <div className="hero-line mt-10 flex flex-wrap items-center gap-4">
                        <a
                            href="#reservations"
                            className="bg-basilico-gold group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-medium text-black no-underline transition-colors hover:bg-[#e6b674]"
                        >
                            Reserve a Table
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </a>
                        <a
                            href="#menu"
                            className="text-basilico-warm inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-light no-underline transition-colors hover:border-white/50 hover:text-white"
                        >
                            View the Menu
                        </a>
                    </div>
                </div>

                <div className="hero-card mx-auto w-full max-w-[450px] lg:ml-auto">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(217,163,95,0.1)]">
                        <video
                            src={HERO_VIDEO}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
                            <p className="text-basilico-gold m-0 text-[10px] font-light tracking-[0.3em] uppercase">
                                Chef&apos;s Special
                            </p>
                            <p className="font-playfair m-0 mt-1 text-lg text-white">
                                Truffle Wagyu Ribeye
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function SectionHeading({ eyebrow, title, children }) {
    return (
        <FadeIn className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
                <p className="text-basilico-gold m-0 mb-4 text-xs font-light tracking-[0.35em] uppercase">
                    {eyebrow}
                </p>
                <h2 className="font-playfair m-0 max-w-xl text-3xl leading-tight font-normal text-white md:text-5xl">
                    {title}
                </h2>
            </div>
            {children}
        </FadeIn>
    );
}

/* -------------------------------------------------------------------------- */

function MenuModal({ open, onClose }) {
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = event => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            onClick={event => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="bg-basilico-ink/80 fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto p-4 backdrop-blur-xl sm:p-10"
        >
            <div className="relative my-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(217,163,95,0.1)] backdrop-blur-md sm:p-12">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close menu"
                    className="text-basilico-warm absolute top-6 right-6 cursor-pointer rounded-full border border-white/10 bg-transparent p-2.5 transition-colors hover:text-white"
                >
                    <X size={18} />
                </button>

                <p className="text-basilico-gold m-0 text-xs font-light tracking-[0.35em] uppercase">
                    Basilico
                </p>
                <h2 className="font-playfair m-0 mt-3 mb-10 text-4xl font-normal text-white">
                    The Full Menu
                </h2>

                {FULL_MENU.map(section => (
                    <div key={section.category} className="mb-10 last:mb-0">
                        <h3 className="font-playfair text-basilico-gold m-0 mb-5 text-xl font-normal italic">
                            {section.category}
                        </h3>
                        <ul className="m-0 flex list-none flex-col gap-4 p-0">
                            {section.items.map(([name, price]) => (
                                <li key={name} className="flex items-baseline gap-3">
                                    <span className="text-sm font-light text-white">{name}</span>
                                    {/* The leader. A flexible dashed rule is the
                                     * only piece here that has to stretch. */}
                                    <span className="min-w-6 flex-1 translate-y-[-3px] border-b border-dashed border-white/20" />
                                    <span className="text-basilico-gold text-sm font-light">
                                        {price}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FeaturedDishes({ onOpenMenu }) {
    return (
        <section id="menu" className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
            <SectionHeading eyebrow="Featured" title="Four plates worth the journey">
                <button
                    type="button"
                    onClick={onOpenMenu}
                    className="border-basilico-gold/60 text-basilico-gold hover:bg-basilico-gold cursor-pointer rounded-full border bg-transparent px-7 py-3 text-sm font-light tracking-wide transition-colors hover:text-black"
                >
                    View Full Menu
                </button>
            </SectionHeading>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {DISHES.map((dish, i) => (
                    <FadeIn
                        key={dish.name}
                        delay={i * 0.08}
                        className="group rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                    >
                        <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                            <img
                                src={dish.image}
                                alt={dish.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="px-2 pt-5 pb-2">
                            <div className="flex items-baseline justify-between gap-3">
                                <h3 className="font-playfair m-0 text-lg font-normal text-white">
                                    {dish.name}
                                </h3>
                                <span className="text-basilico-gold text-sm font-light">
                                    {dish.price}
                                </span>
                            </div>
                            <p className="text-basilico-warm m-0 mt-2 text-sm leading-relaxed font-light">
                                {dish.body}
                            </p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function About() {
    return (
        <section id="about" className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
                <FadeIn>
                    <p className="text-basilico-gold m-0 mb-4 text-xs font-light tracking-[0.35em] uppercase">
                        The Kitchen
                    </p>
                    <h2 className="font-playfair m-0 text-3xl leading-tight font-normal text-white md:text-5xl">
                        One menu, rewritten every season it earns it.
                    </h2>
                    <p className="text-basilico-warm m-0 mt-8 leading-relaxed font-light">
                        Alexander Thorne opened Basilico in 2009 with eight seats and a single
                        induction ring. The room is larger now and the ring is still there, on the
                        pass, mostly for the sauces he refuses to let anyone else finish.
                    </p>
                    <p className="text-basilico-warm m-0 mt-5 leading-relaxed font-light">
                        The cooking is Northern Italian by discipline and stubbornly local by
                        sourcing — turbot from Cornwall, beef aged in the cellar downstairs, and a
                        saffron grower in Sardinia who has been sending the same envelope every
                        November for eleven years.
                    </p>
                    <p className="font-playfair text-basilico-warm m-0 mt-10 text-4xl italic opacity-80">
                        Alexander Thorne
                    </p>
                </FadeIn>

                <FadeIn delay={0.15} x={30} y={0} className="relative">
                    <div className="bg-basilico-gold/10 absolute inset-0 -z-10 rounded-full blur-3xl" />
                    <div className="border-basilico-gold/20 mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border">
                        <img
                            src={GALLERY[0]}
                            alt="The pass at Basilico"
                            loading="lazy"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function TastingMenu() {
    return (
        <section className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
            <SectionHeading eyebrow="Chef's Table" title="The seven-course tasting menu" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {TASTING.map((column, i) => (
                    <FadeIn
                        key={column.title}
                        delay={i * 0.15}
                        className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
                    >
                        <h3 className="font-playfair m-0 text-2xl font-normal text-white">
                            {column.title}
                        </h3>
                        <p className="text-basilico-gold m-0 mt-2 text-sm font-light tracking-wide">
                            {column.lead}
                        </p>
                        <ul className="text-basilico-warm m-0 mt-8 flex list-none flex-col gap-3 p-0 text-sm leading-relaxed font-light">
                            {column.lines.map(line => (
                                <li key={line} className="border-b border-white/5 pb-3 last:border-0">
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Immersive() {
    const frameRef = useScrollFrame();
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: frameRef,
        offset: ['start end', 'end start'],
    });

    /* The plate travels a fifth of the section's height against the scroll —
     * a `background-attachment: fixed` parallax, minus the mobile bugs. */
    const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

    return (
        <section
            id="experience"
            ref={sectionRef}
            className="relative my-12 overflow-hidden py-32 md:py-44"
        >
            <motion.img
                src={HERO_IMAGE}
                alt=""
                aria-hidden="true"
                style={{ y }}
                className="pointer-events-none absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover opacity-40"
            />
            <div className="from-basilico-ink via-basilico-ink/60 to-basilico-ink pointer-events-none absolute inset-0 bg-gradient-to-b" />

            <div className="relative mx-auto max-w-[1280px] px-6">
                <FadeIn>
                    <p className="text-basilico-gold m-0 mb-4 text-xs font-light tracking-[0.35em] uppercase">
                        The Rooms
                    </p>
                    <h2 className="font-playfair m-0 max-w-2xl text-3xl leading-tight font-normal text-white md:text-5xl">
                        An evening built to be sat through slowly.
                    </h2>
                </FadeIn>

                <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
                    {EXPERIENCES.map((item, i) => (
                        <FadeIn key={item.title} delay={i * 0.12}>
                            <h3 className="font-playfair m-0 text-xl font-normal text-white">
                                {item.title}
                            </h3>
                            <p className="text-basilico-warm m-0 mt-3 leading-relaxed font-light">
                                {item.body}
                            </p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Testimonials() {
    const [index, setIndex] = useState(0);
    const active = TESTIMONIALS[index];

    return (
        <section className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
            <SectionHeading eyebrow="Press" title="What the critics filed" />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-md md:p-16">
                <Quote className="text-basilico-gold/40 mb-8" size={40} />

                {/* Keyed so React swaps the node and the entrance replays. */}
                <motion.blockquote
                    key={active.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="m-0"
                >
                    <p className="font-playfair m-0 text-2xl leading-relaxed font-normal text-white italic md:text-3xl">
                        {active.quote}
                    </p>
                    <footer className="mt-8 not-italic">
                        <p className="m-0 text-sm font-light tracking-wide text-white">
                            {active.name}
                        </p>
                        <p className="text-basilico-gold m-0 mt-1 text-xs font-light tracking-[0.2em] uppercase">
                            {active.title}
                        </p>
                    </footer>
                </motion.blockquote>

                <div className="mt-12 flex items-center gap-3">
                    {TESTIMONIALS.map((item, i) => (
                        <button
                            key={item.name}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Read the review from ${item.title}`}
                            aria-current={i === index}
                            className={`h-1.5 cursor-pointer rounded-full border-none transition-all duration-500 ${
                                i === index ? 'bg-basilico-gold w-10' : 'w-4 bg-white/20'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * A labelled field group. A `div` and an id'd `<span>` rather than a `<label>`:
 * `<button>` is labelable, so a wrapping label would forward its click into the
 * Select/DateField trigger and toggle the popover twice.
 */
function Field({ id, label, className = '', children }) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <span
                id={`${id}-label`}
                className="text-basilico-warm text-xs font-light tracking-[0.2em] uppercase"
            >
                {label}
            </span>
            {children}
        </div>
    );
}

function Reservations() {
    const [sent, setSent] = useState(false);

    return (
        <section id="reservations" className="relative py-24 md:py-32">
            <div className="bg-basilico-gold/10 pointer-events-none absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]" />

            <div className="relative mx-auto max-w-[1280px] px-6">
                <FadeIn className="mx-auto max-w-2xl text-center">
                    <p className="text-basilico-gold m-0 mb-4 text-xs font-light tracking-[0.35em] uppercase">
                        Reservations
                    </p>
                    <h2 className="font-playfair m-0 text-3xl leading-tight font-normal text-white md:text-5xl">
                        Six seats a night. Two of them could be yours.
                    </h2>
                </FadeIn>

                <FadeIn
                    delay={0.15}
                    className="mx-auto mt-14 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(217,163,95,0.1)] backdrop-blur-md md:p-10"
                >
                    <form
                        onSubmit={event => {
                            event.preventDefault();
                            setSent(true);
                        }}
                        className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                    >
                        <Field id="basilico-date" label="Date">
                            <DateField
                                name="date"
                                placeholder="Choose a date"
                                locale="en-GB"
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="basilico-date-label"
                            />
                        </Field>

                        <Field id="basilico-time" label="Time">
                            <Select
                                name="time"
                                options={TIME_OPTIONS}
                                defaultValue="19:00"
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="basilico-time-label"
                            />
                        </Field>

                        <Field id="basilico-guests" label="Guests">
                            <Select
                                name="guests"
                                options={GUEST_OPTIONS}
                                defaultValue="2 guests"
                                className={FIELD_CLASS}
                                menuClassName={MENU_CLASS}
                                aria-labelledby="basilico-guests-label"
                            />
                        </Field>

                        <Field id="basilico-email" label="Email">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="you@example.com"
                                aria-labelledby="basilico-email-label"
                                className={FIELD_CLASS}
                            />
                        </Field>

                        <Field
                            id="basilico-notes"
                            label="Special Requests"
                            className="sm:col-span-2"
                        >
                            <textarea
                                rows={4}
                                name="notes"
                                placeholder="Allergies, occasions, anything we should know."
                                aria-labelledby="basilico-notes-label"
                                className={`${FIELD_CLASS} resize-none`}
                            />
                        </Field>

                        <div className="flex flex-col items-center gap-4 sm:col-span-2 sm:flex-row sm:justify-between">
                            <p
                                aria-live="polite"
                                className="text-basilico-gold m-0 text-sm font-light"
                            >
                                {sent
                                    ? 'Request received — we confirm by email within a day.'
                                    : ' '}
                            </p>
                            <button
                                type="submit"
                                className="bg-basilico-gold group inline-flex cursor-pointer items-center gap-3 rounded-full border-none px-8 py-4 text-sm font-medium text-black transition-colors hover:bg-[#e6b674]"
                            >
                                Request a Table
                                <ArrowRight
                                    size={16}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </button>
                        </div>
                    </form>
                </FadeIn>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/** Asymmetric on purpose: two tiles take a double span so the grid never
 *  settles into rows of equal weight. */
const GALLERY_SPANS = [
    'sm:col-span-2 sm:row-span-2',
    '',
    '',
    'sm:col-span-2',
    'sm:col-span-2',
    'sm:col-span-2',
];

function Gallery() {
    return (
        <section className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
            <SectionHeading eyebrow="Visual Story" title="A night, in six frames" />

            <div className="grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-4">
                {GALLERY.map((src, i) => (
                    <FadeIn
                        key={src}
                        delay={i * 0.06}
                        className={`group overflow-hidden rounded-2xl border border-white/10 ${GALLERY_SPANS[i]}`}
                    >
                        <img
                            src={src}
                            alt="Basilico, mid-service"
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Footer() {
    return (
        <footer className="border-t border-white/10">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 py-20 md:grid-cols-3">
                <div>
                    <p className="font-playfair m-0 text-2xl tracking-wide text-white">Basilico</p>
                    <p className="text-basilico-warm m-0 mt-4 max-w-xs leading-relaxed font-light">
                        Seven courses and one sitting a night, served at the counter since 2009.
                    </p>
                </div>

                <div className="flex flex-col gap-5">
                    {CONTACT.map(({ Icon, lines }) => (
                        <div key={lines[0]} className="flex gap-4">
                            <Icon size={18} className="text-basilico-gold mt-0.5 shrink-0" />
                            <div>
                                {lines.map(line => (
                                    <p
                                        key={line}
                                        className="text-basilico-warm m-0 text-sm leading-relaxed font-light"
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <p className="m-0 text-sm font-light tracking-wide text-white">
                        The occasional letter
                    </p>
                    <p className="text-basilico-warm m-0 mt-3 text-sm leading-relaxed font-light">
                        Menu changes and cellar releases. Six times a year, never more.
                    </p>
                    <form
                        onSubmit={event => event.preventDefault()}
                        className="mt-5 flex items-center gap-2"
                    >
                        <label className="sr-only" htmlFor="basilico-newsletter">
                            Email address
                        </label>
                        <input
                            id="basilico-newsletter"
                            type="email"
                            placeholder="you@example.com"
                            className={FIELD_CLASS}
                        />
                        <button
                            type="submit"
                            aria-label="Subscribe"
                            className="bg-basilico-gold flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none text-black transition-colors hover:bg-[#e6b674]"
                        >
                            <Mail size={18} />
                        </button>
                    </form>
                </div>
            </div>

            <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-8 text-xs font-light text-white/40 sm:flex-row">
                <span>© {YEAR} Basilico. All rights reserved.</span>
                <span>Chef Alexander Thorne</span>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Basilico() {
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <PageFrame
            title="Basilico — Crafting Exceptional Culinary Experiences"
            /* The dot replaces the pointer, so the native one goes — but only
             * where CustomCursor actually mounts, which is the same condition. */
            className="type-inter bg-basilico-ink pointer-fine:cursor-none"
            scroll={!menuOpen}
        >
            <BackButton fixed top={88} left={24} />
            <CustomCursor />
            <Navbar />

            <main className="mx-auto max-w-[1280px]">
                <Hero />
                <FeaturedDishes onOpenMenu={openMenu} />
                <About />
                <TastingMenu />
                <Immersive />
                <Testimonials />
                <Reservations />
                <Gallery />
            </main>

            <Footer />
            <MenuModal open={menuOpen} onClose={closeMenu} />
        </PageFrame>
    );
}
