import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Check,
    Fingerprint,
    Hexagon,
    Landmark,
    Lock,
    Menu,
    Search,
    Shield,
    ShieldCheck,
    X,
} from 'lucide-react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import MobileMenu from './shared/MobileMenu.jsx';
import SectionHeading from './shared/SectionHeading.jsx';
import SectionReveal from './shared/SectionReveal.jsx';
import StatBlock from './shared/StatBlock.jsx';
import Ticker from './shared/Ticker.jsx';
import Tooltip from './shared/Tooltip.jsx';

/**
 * Coinwise — a light crypto platform: gold on off-white, glass chips, one video.
 *
 * ─── The load sequence is a GSAP timeline ────────────────────────────────────
 *
 * Not five `whileInView`s, because the brief choreographs it as one: header,
 * eyebrow, heading, paragraph, buttons, each a 1s `power3.out` starting 100ms
 * after the last. That is a timeline's job, and `gsap.context()` scopes the
 * selectors to this component and reverts every tween on unmount.
 *
 * The trigger is the video signalling it can play — but only as the *first* of
 * two conditions. Everything the timeline animates starts at `opacity: 0`, so a
 * clip that never loads (offline, a codec the browser refuses, a blocked
 * request) would leave the hero permanently blank. A 2s fallback fires the same
 * sequence regardless; the context ref makes whichever arrives first the only
 * one that builds a timeline.
 *
 * ─── GSAP runs on time here, never on scroll ─────────────────────────────────
 *
 * `README.md` is explicit about why: ScrollTrigger defaults its `scroller` to
 * the document, and every template in this folder is a `position: fixed` page
 * that scrolls *inside* `PageFrame`. Wiring that up per trigger is work with a
 * silent failure mode. Everything below the hero that reacts to scroll uses
 * `SectionReveal` instead, and the ticker in the footer is CSS.
 *
 * ─── The markets table ───────────────────────────────────────────────────────
 *
 * The only place in this library with a sortable, searchable data table, and the
 * only one with a loading state. Both are deliberate — see `Markets` below.
 */

const HERO_VIDEO = '/assets/coinwise/hero.mp4';
const STILL = name => `/assets/coinwise/stills/${name}.webp`;

const NAV_LINKS = [
    { label: 'Home', href: '#top' },
    { label: 'Markets', href: '#markets' },
    { label: 'Compare', href: '#compare' },
    { label: 'Security', href: '#security' },
    { label: 'Start', href: '#start' },
];

/** Longest the hero stays hidden waiting on the clip. */
const REVEAL_FALLBACK_MS = 2000;

/** Milliseconds the markets table spends in its skeleton state. */
const MARKETS_LOAD_MS = 900;

/* The gold ramp, on both the CTA fills and the clipped word in the heading. */
const GOLD_GRADIENT = 'bg-gradient-to-r from-coinwise-accent to-coinwise-accent-dark';

const STATS = [
    { value: 2400000, label: 'Accounts opened', format: n => `${(n / 1e6).toFixed(1)}M` },
    { value: 41, label: 'Billion traded', prefix: '$', suffix: 'B' },
    { value: 128, label: 'Countries served' },
    { value: 99.99, label: 'Uptime, four years', suffix: '%', format: n => n.toFixed(2) },
];

const MARKETS = [
    { symbol: 'BTC', name: 'Bitcoin', price: 71284.4, change: 2.41, cap: 1402 },
    { symbol: 'ETH', name: 'Ethereum', price: 3842.16, change: 1.08, cap: 462 },
    { symbol: 'SOL', name: 'Solana', price: 214.72, change: -3.16, cap: 98 },
    { symbol: 'XRP', name: 'Ripple', price: 0.6218, change: 0.44, cap: 35 },
    { symbol: 'ADA', name: 'Cardano', price: 0.4791, change: -1.92, cap: 17 },
    { symbol: 'AVAX', name: 'Avalanche', price: 38.06, change: 5.73, cap: 15 },
    { symbol: 'LINK', name: 'Chainlink', price: 17.44, change: -0.61, cap: 11 },
    { symbol: 'DOT', name: 'Polkadot', price: 7.12, change: 3.08, cap: 10 },
];

const COLUMNS = [
    { key: 'name', label: 'Asset', align: 'left', numeric: false },
    { key: 'price', label: 'Price', align: 'right', numeric: true },
    { key: 'change', label: '24h', align: 'right', numeric: true },
    { key: 'cap', label: 'Market cap', align: 'right', numeric: true },
];

const COMPARISON = [
    { feature: 'Settlement', coinwise: 'Instant', bank: '2–3 working days', exchange: 'Instant' },
    { feature: 'Withdrawal fee', coinwise: 'None', bank: '£25 wire', exchange: '1.5% + network' },
    { feature: 'Assets held', coinwise: 'Segregated, in your name', bank: 'Pooled', exchange: 'Omnibus' },
    { feature: 'Proof of reserves', coinwise: 'Monthly, published', bank: 'Not applicable', exchange: 'Occasionally' },
    { feature: 'Cold storage', coinwise: '98% of balances', bank: 'Not applicable', exchange: 'Undisclosed' },
    { feature: 'Support', coinwise: 'Human, under 4h', bank: 'Branch hours', exchange: 'Ticket queue' },
];

const SECURITY = [
    {
        Icon: Lock,
        title: 'Cold by default',
        body: '98% of balances never touch an internet-connected machine. The hot wallet covers one day of withdrawals and is topped up manually.',
        span: 'md:col-span-2',
        still: 'vault',
    },
    {
        Icon: Fingerprint,
        title: 'Keys you can export',
        body: 'Leave whenever you want, with everything.',
    },
    {
        Icon: ShieldCheck,
        title: 'Reserves, monthly',
        body: 'A Merkle root you can check your own balance against.',
    },
    {
        Icon: Landmark,
        title: 'Segregated, in your name',
        body: 'Not pooled with the company float. If we fail, your assets are not part of the estate.',
        span: 'md:col-span-2',
        still: 'security',
    },
];

const FOOTER_COLUMNS = [
    { title: 'Product', links: ['Markets', 'Wallet', 'Staking', 'Business'] },
    { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
    { title: 'Legal', links: ['Terms', 'Privacy', 'Reserves', 'Complaints'] },
    { title: 'Support', links: ['Help centre', 'Status', 'Contact', 'Security'] },
];

const money = value =>
    value >= 1
        ? `$${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${value.toFixed(4)}`;

/* -------------------------------------------------------------------------- */

function VideoBackground({ onReady }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        const signal = () => onReady();
        video.addEventListener('canplay', signal, { once: true });
        /* A cached file can already be past `canplay` before this runs. */
        if (video.readyState >= 3) signal();

        return () => video.removeEventListener('canplay', signal);
    }, [onReady]);

    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <video
                ref={videoRef}
                src={HERO_VIDEO}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover opacity-90"
            />
            {/* Fades the top half back to the page colour so the navigation
             * reads as sitting on paper rather than on footage. */}
            <div className="from-coinwise-bg absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent" />
        </div>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The header, now `sticky` rather than merely first in the flow.
 *
 * `sticky`, not `fixed`: the hero's GSAP entrance animates this element, and a
 * fixed header would have to be lifted out of the timeline's scope to keep the
 * selector working. Sticky leaves it exactly where the timeline expects it and
 * still pins on scroll — the same argument `CATALOGUE.md` makes for preferring
 * sticky over ScrollTrigger's `pin`.
 *
 * The mobile panel moves from a hand-rolled `AnimatePresence` dropdown to
 * `MobileMenu`'s `collapse` variant. That swap is the point of the shared
 * component: the original had no Escape handler, no focus management, and left
 * its links in the tab order while closed.
 */
function Header({ menuOpen, onToggleMenu, onNavigate }) {
    return (
        <header className="gsap-hero-header sticky top-0 z-50 opacity-0">
            <div className="bg-coinwise-bg/80 border-b border-transparent backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <a
                        href="#top"
                        className="text-coinwise-primary flex items-center gap-2.5 no-underline"
                    >
                        <Hexagon
                            className="text-coinwise-accent h-8 w-8"
                            strokeWidth={2}
                            fill="rgba(212, 175, 55, 0.2)"
                        />
                        <span className="text-2xl font-bold tracking-wide">COINWISE</span>
                    </a>

                    <nav className="hidden items-center space-x-10 lg:flex">
                        {NAV_LINKS.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-coinwise-primary/80 hover:text-coinwise-accent text-sm font-medium no-underline transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <a
                        href="#start"
                        className={`hidden items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white no-underline transition-all hover:shadow-lg hover:shadow-coinwise-accent/30 lg:inline-flex ${GOLD_GRADIENT}`}
                    >
                        Get Started
                        <ArrowRight size={16} />
                    </a>

                    <button
                        type="button"
                        onClick={onToggleMenu}
                        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={menuOpen}
                        className="text-coinwise-primary cursor-pointer rounded-full border border-gray-200 bg-white/80 p-2 backdrop-blur-md lg:hidden"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* `collapse` — it pushes the page down rather than covering it,
                 * which is what a bar docked to the top of a light page wants. */}
                <MobileMenu
                    variant="collapse"
                    open={menuOpen}
                    onClose={onNavigate}
                    className="border-t border-gray-100 lg:hidden"
                >
                    <div className="flex flex-col gap-1 px-6 py-4">
                        {NAV_LINKS.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={onNavigate}
                                className="text-coinwise-primary rounded-xl px-3 py-3 text-sm font-medium no-underline transition-colors hover:bg-gray-50"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="#start"
                            onClick={onNavigate}
                            className={`mt-3 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white no-underline ${GOLD_GRADIENT}`}
                        >
                            Get Started
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </MobileMenu>
            </div>
        </header>
    );
}

/* -------------------------------------------------------------------------- */

function HeroContent() {
    return (
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 text-center lg:px-8">
            {/* Optically centres the block: the header above it is part of the
             * viewport but not of the composition. */}
            <div className="mt-[-100px] flex flex-col items-center">
                <div className="gsap-hero-eyebrow mb-6 inline-flex items-center space-x-3 rounded-full border border-white/50 bg-white/70 px-4 py-1.5 opacity-0 shadow-sm backdrop-blur-md">
                    <Shield size={14} className="text-coinwise-accent" />
                    <span className="text-coinwise-secondary text-xs font-semibold tracking-wider">
                        SECURE • SIMPLE • FUTURE
                    </span>
                </div>

                <h1 className="gsap-hero-heading text-coinwise-primary m-0 mb-6 text-6xl leading-[1.05] font-extrabold tracking-tight opacity-0 md:text-[80px]">
                    Build <span className={`bg-clip-text text-transparent ${GOLD_GRADIENT}`}>Crypto</span>{' '}
                    Wealth
                </h1>

                <p className="gsap-hero-copy text-coinwise-secondary m-0 mb-6 max-w-md text-lg leading-relaxed font-medium opacity-0 md:text-xl">
                    Buy, trade, and grow your digital assets with a secure and trusted platform.
                </p>

                <div className="gsap-hero-actions flex flex-col space-y-4 opacity-0 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <a
                        href="#markets"
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-white no-underline transition-all hover:shadow-lg hover:shadow-coinwise-accent/30 ${GOLD_GRADIENT}`}
                    >
                        Start Trading
                        <ArrowRight size={18} />
                    </a>
                    <a
                        href="#compare"
                        className="text-coinwise-primary inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-8 py-4 font-semibold no-underline backdrop-blur-md transition-all hover:bg-white"
                    >
                        Why Coinwise
                    </a>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The numbers, counting up as they arrive.
 *
 * `StatBlock` renders an `AnimatedCounter` for any numeric `value`, which is the
 * whole reason that component takes numbers as well as strings — `ROADMAP.md`
 * notes that stat blocks exist in four templates and every one of them was a
 * static string. This is the first that is not.
 */
function Numbers() {
    return (
        <section className="border-y border-gray-100 bg-white">
            <StatBlock.Group className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 lg:grid-cols-4 lg:px-8">
                {STATS.map((stat, i) => (
                    <SectionReveal key={stat.label} delay={i * 0.08} duration={0.6}>
                        <StatBlock
                            {...stat}
                            align="center"
                            valueClassName="text-coinwise-primary text-3xl font-extrabold tracking-tight md:text-4xl"
                            labelClassName="text-coinwise-secondary mt-2 text-xs font-medium tracking-wide md:text-sm"
                        />
                    </SectionReveal>
                ))}
            </StatBlock.Group>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * The markets table — search, sort, a loading state and an empty state.
 *
 * ─── Why a real table ────────────────────────────────────────────────────────
 *
 * `<table>` with `<th scope="col">`, not a grid of divs. A screen reader reading
 * a div grid announces "0.6218" with no idea it is Ripple's price; a real table
 * announces the row and column header with every cell. This is the one section
 * in the library where that matters, because it is the only one that is
 * genuinely tabular data.
 *
 * ─── Sorting lives in the header buttons ─────────────────────────────────────
 *
 * `aria-sort` on the `<th>` is what conveys the state — a rotated chevron
 * conveys nothing to anyone not looking at it. Pressing the active column flips
 * the direction; pressing a new one starts descending for numbers and ascending
 * for text, which is what each is useful as by default.
 *
 * ─── The skeleton is not decoration ──────────────────────────────────────────
 *
 * `ROADMAP.md` lists `Skeleton` and `EmptyState` as missing primitives, and this
 * is the section that needs both. The skeleton rows are sized to the real ones
 * so nothing reflows when the data lands — a spinner in a box that then becomes
 * an eight-row table moves everything below it down the page.
 *
 * `aria-busy` on the table is what tells a screen reader to wait rather than
 * reading eight rows of placeholder.
 */
function Markets() {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState({ key: 'cap', direction: 'desc' });
    const [loading, setLoading] = useState(true);

    /* Stands in for a fetch. Real data would replace this effect wholesale;
     * what it exists to exercise is the skeleton and the reflow-free handover. */
    useEffect(() => {
        const timer = window.setTimeout(() => setLoading(false), MARKETS_LOAD_MS);
        return () => window.clearTimeout(timer);
    }, []);

    const rows = useMemo(() => {
        const needle = query.trim().toLowerCase();

        const filtered = needle
            ? MARKETS.filter(
                  row =>
                      row.name.toLowerCase().includes(needle) ||
                      row.symbol.toLowerCase().includes(needle)
              )
            : MARKETS;

        const column = COLUMNS.find(c => c.key === sort.key);
        const factor = sort.direction === 'asc' ? 1 : -1;

        /* A copy — `Array.prototype.sort` mutates, and mutating the module-scope
         * `MARKETS` would make the sort order sticky across re-renders. */
        return [...filtered].sort((a, b) => {
            const left = a[sort.key];
            const right = b[sort.key];
            return column?.numeric
                ? (left - right) * factor
                : String(left).localeCompare(String(right)) * factor;
        });
    }, [query, sort]);

    const toggleSort = column => {
        setSort(current =>
            current.key === column.key
                ? { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                : { key: column.key, direction: column.numeric ? 'desc' : 'asc' }
        );
    };

    const cell = 'px-4 py-4 md:px-6';

    return (
        <section id="markets" className="bg-coinwise-bg py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Markets"
                    title="Every asset, one ledger"
                    lead="Live across forty pairs. No maker fee under £10,000 a month."
                    eyebrowClassName="text-coinwise-accent text-xs font-semibold tracking-[0.3em] uppercase"
                    titleClassName="text-coinwise-primary text-4xl font-extrabold tracking-tight md:text-5xl"
                    leadClassName="text-coinwise-secondary mt-4 max-w-md font-medium"
                    action={
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={16}
                                aria-hidden="true"
                                className="text-coinwise-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
                            />
                            <input
                                type="search"
                                value={query}
                                onChange={event => setQuery(event.target.value)}
                                placeholder="Search assets"
                                aria-label="Search assets"
                                aria-controls="markets-table"
                                className="text-coinwise-primary w-full rounded-full border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-coinwise-accent"
                            />
                        </div>
                    }
                />

                <div className="mt-10 overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
                    <table
                        id="markets-table"
                        aria-busy={loading}
                        className="w-full min-w-[36rem] border-collapse text-left"
                    >
                        <caption className="sr-only">
                            Asset prices, sorted by {sort.key}, {sort.direction}ending
                        </caption>

                        <thead>
                            <tr className="border-b border-gray-100">
                                {COLUMNS.map(column => {
                                    const active = sort.key === column.key;
                                    return (
                                        <th
                                            key={column.key}
                                            scope="col"
                                            aria-sort={
                                                active
                                                    ? sort.direction === 'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                            className={`${cell} ${
                                                column.align === 'right' ? 'text-right' : ''
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleSort(column)}
                                                className={`text-coinwise-secondary inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-xs font-semibold tracking-wider uppercase transition-colors hover:text-coinwise-primary ${
                                                    active ? 'text-coinwise-primary' : ''
                                                }`}
                                            >
                                                {column.label}
                                                {active &&
                                                    (sort.direction === 'asc' ? (
                                                        <ArrowUp size={12} aria-hidden="true" />
                                                    ) : (
                                                        <ArrowDown size={12} aria-hidden="true" />
                                                    ))}
                                            </button>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {loading &&
                                /* Sized to the real rows, so the handover moves
                                 * nothing on the page. */
                                Array.from({ length: 6 }, (_, i) => (
                                    <tr key={`skeleton-${i}`} className="border-b border-gray-50">
                                        {COLUMNS.map(column => (
                                            <td key={column.key} className={cell}>
                                                <span
                                                    className={`block h-4 animate-pulse rounded bg-gray-100 ${
                                                        column.key === 'name' ? 'w-32' : 'w-20'
                                                    } ${column.align === 'right' ? 'ml-auto' : ''}`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                            {!loading &&
                                rows.map(row => (
                                    <tr
                                        key={row.symbol}
                                        className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60"
                                    >
                                        <th scope="row" className={`${cell} font-normal`}>
                                            <span className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="bg-coinwise-accent/10 text-coinwise-accent flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
                                                >
                                                    {row.symbol}
                                                </span>
                                                <span className="text-coinwise-primary font-semibold">
                                                    {row.name}
                                                </span>
                                            </span>
                                        </th>

                                        <td
                                            className={`${cell} text-coinwise-primary text-right font-semibold tabular-nums`}
                                        >
                                            {money(row.price)}
                                        </td>

                                        <td className={`${cell} text-right font-semibold tabular-nums`}>
                                            <span
                                                className={
                                                    row.change >= 0
                                                        ? 'text-emerald-600'
                                                        : 'text-red-500'
                                                }
                                            >
                                                {row.change >= 0 ? '+' : ''}
                                                {row.change.toFixed(2)}%
                                            </span>
                                        </td>

                                        <td
                                            className={`${cell} text-coinwise-secondary text-right tabular-nums`}
                                        >
                                            ${row.cap}B
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {!loading && rows.length === 0 && (
                        <p className="text-coinwise-secondary m-0 px-6 py-16 text-center text-sm">
                            Nothing matches “{query.trim()}”. We list forty pairs — try the ticker
                            rather than the full name.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * Coinwise against the two things it is actually being compared with.
 *
 * ─── The honest version of a comparison table ────────────────────────────────
 *
 * Every row is a real difference with a real value in all three columns, rather
 * than the usual ticks-in-our-column-and-crosses-in-theirs. "Not applicable" for
 * a bank's cold storage is the truthful cell, and it is more persuasive than a
 * cross would be.
 *
 * ─── Markup ──────────────────────────────────────────────────────────────────
 *
 * A real `<table>` again, with the feature name as `<th scope="row">`, so each
 * cell is announced with both its feature and its provider. The narrow layout
 * scrolls horizontally inside its own container rather than reflowing into
 * cards: three-way comparisons stacked into cards lose the comparison, which is
 * the entire content.
 */
function Compare() {
    const cell = 'px-5 py-4 md:px-6 md:py-5 text-sm';

    return (
        <section id="compare" className="bg-white py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Compare"
                    title="The differences that cost money"
                    lead="Six rows, no crosses in anyone else's column. These are the ones people actually switch over."
                    align="center"
                    layout="stacked"
                    className="mx-auto max-w-2xl"
                    eyebrowClassName="text-coinwise-accent text-xs font-semibold tracking-[0.3em] uppercase"
                    titleClassName="text-coinwise-primary text-4xl font-extrabold tracking-tight md:text-5xl"
                    leadClassName="text-coinwise-secondary mx-auto mt-4 max-w-xl font-medium"
                />

                <SectionReveal
                    duration={0.7}
                    className="mt-12 overflow-x-auto rounded-3xl border border-gray-100"
                >
                    <table className="w-full min-w-[40rem] border-collapse text-left">
                        <thead>
                            <tr>
                                <th scope="col" className={`${cell} w-1/4`}>
                                    <span className="sr-only">Feature</span>
                                </th>
                                <th
                                    scope="col"
                                    className={`${cell} bg-coinwise-accent/8 text-coinwise-primary rounded-t-2xl text-base font-extrabold`}
                                >
                                    Coinwise
                                </th>
                                <th
                                    scope="col"
                                    className={`${cell} text-coinwise-secondary font-semibold`}
                                >
                                    High-street bank
                                </th>
                                <th
                                    scope="col"
                                    className={`${cell} text-coinwise-secondary font-semibold`}
                                >
                                    Typical exchange
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {COMPARISON.map(row => (
                                <tr key={row.feature} className="border-t border-gray-100">
                                    <th
                                        scope="row"
                                        className={`${cell} text-coinwise-secondary font-semibold`}
                                    >
                                        {row.feature}
                                    </th>
                                    <td
                                        className={`${cell} bg-coinwise-accent/8 text-coinwise-primary font-semibold`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Check
                                                size={14}
                                                strokeWidth={3}
                                                aria-hidden="true"
                                                className="text-coinwise-accent shrink-0"
                                            />
                                            {row.coinwise}
                                        </span>
                                    </td>
                                    <td className={`${cell} text-coinwise-secondary`}>{row.bank}</td>
                                    <td className={`${cell} text-coinwise-secondary`}>
                                        {row.exchange}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionReveal>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * Security, as a bento of mixed spans.
 *
 * The two wide cells carry a still and the two narrow ones do not, which is what
 * keeps this from being four identical cards in a row. `Tooltip` on the audit
 * marks is the library's first — hover *or* focus, with `aria-describedby`, so
 * the detail is reachable from the keyboard rather than being a `title`
 * attribute nobody can style and screen readers announce inconsistently.
 */
function Security() {
    return (
        <section id="security" className="bg-coinwise-bg py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Security"
                    title="Boring, on purpose"
                    lead="Nothing here is novel. That is the argument."
                    eyebrowClassName="text-coinwise-accent text-xs font-semibold tracking-[0.3em] uppercase"
                    titleClassName="text-coinwise-primary text-4xl font-extrabold tracking-tight md:text-5xl"
                    leadClassName="text-coinwise-secondary mt-4 max-w-md font-medium"
                    action={
                        <div className="flex flex-wrap items-center gap-3">
                            {[
                                ['SOC 2', 'Type II, audited annually by a Big Four firm.'],
                                ['ISO 27001', 'Certified since 2021, recertified every three years.'],
                                ['FCA', 'Registered as a cryptoasset business, ref 942117.'],
                            ].map(([mark, detail]) => (
                                <Tooltip
                                    key={mark}
                                    label={detail}
                                    placement="top"
                                    panelClassName="text-coinwise-primary rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
                                >
                                    <span className="text-coinwise-secondary cursor-help rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                                        {mark}
                                    </span>
                                </Tooltip>
                            ))}
                        </div>
                    }
                />

                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {SECURITY.map(({ Icon, title, body, span, still }, i) => (
                        <SectionReveal
                            key={title}
                            delay={i * 0.08}
                            duration={0.6}
                            className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 ${
                                span ?? ''
                            }`}
                        >
                            {still && (
                                <>
                                    <img
                                        src={STILL(still)}
                                        alt=""
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover opacity-15"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
                                </>
                            )}

                            <div className="relative">
                                <span className="bg-coinwise-accent/10 text-coinwise-accent flex h-11 w-11 items-center justify-center rounded-full">
                                    <Icon size={20} strokeWidth={1.8} />
                                </span>

                                <h3 className="text-coinwise-primary m-0 mt-6 text-xl font-extrabold tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-coinwise-secondary m-0 mt-3 max-w-md leading-relaxed font-medium">
                                    {body}
                                </p>
                            </div>
                        </SectionReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

function Cta() {
    return (
        <section id="start" className="bg-white px-6 pb-24 lg:px-8">
            <SectionReveal
                duration={0.8}
                className={`relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-8 py-20 text-center md:py-24 ${GOLD_GRADIENT}`}
            >
                {/* Two soft fields rather than a flat panel, so the gold has some
                 * depth without a second image to load. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/25 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
                />

                <div className="relative">
                    <h2 className="m-0 text-4xl leading-tight font-extrabold tracking-tight text-white md:text-6xl">
                        Open an account in
                        <br />
                        four minutes.
                    </h2>
                    <p className="m-0 mx-auto mt-6 max-w-lg text-lg font-medium text-white/85">
                        No deposit required to look around. Verification takes as long as
                        photographing your passport.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <a
                            href="#start"
                            className="text-coinwise-primary inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold no-underline transition-transform hover:scale-[1.02]"
                        >
                            Create an account
                            <ArrowRight size={18} />
                        </a>
                        <a
                            href="#markets"
                            className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-4 font-semibold text-white no-underline transition-colors hover:bg-white/10"
                        >
                            See the markets
                        </a>
                    </div>
                </div>
            </SectionReveal>
        </section>
    );
}

/* -------------------------------------------------------------------------- */

/**
 * `FT-05` — a live price strip running above the directory.
 *
 * ─── The strip is the point ──────────────────────────────────────────────────
 *
 * Every other footer in this library opens with either an oversized headline or
 * a link grid. This one opens with the product still working: eight pairs
 * scrolling past on the page's darkest band, which is the one thing a trading
 * platform's footer can say that a marketing headline cannot.
 *
 * `./shared/Ticker` on its `time` engine with `pauseOnHover`. That combination
 * is why the engine is CSS rather than Framer — `animation-play-state: paused`
 * freezes the track exactly where it is and resumes from there, where stopping a
 * Framer repeat means cancelling the animation and restarting it.
 *
 * The fades are `from-coinwise-primary` so the track dissolves into the band
 * rather than being clipped by it.
 */
function Footer() {
    return (
        <footer className="bg-coinwise-primary">
            <div className="border-b border-white/10 py-5">
                <Ticker
                    duration={45}
                    pauseOnHover
                    gap="gap-10"
                    fadeClassName="from-coinwise-primary"
                    fadeWidth="w-24"
                >
                    {MARKETS.map(row => (
                        <span
                            key={row.symbol}
                            className="flex items-center gap-3 text-sm whitespace-nowrap"
                        >
                            <span className="font-bold text-white">{row.symbol}</span>
                            <span className="text-white/70 tabular-nums">{money(row.price)}</span>
                            <span
                                className={`tabular-nums ${
                                    row.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}
                            >
                                {row.change >= 0 ? '+' : ''}
                                {row.change.toFixed(2)}%
                            </span>
                        </span>
                    ))}
                </Ticker>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
                    <div>
                        <a href="#top" className="flex items-center gap-2.5 text-white no-underline">
                            <Hexagon
                                className="text-coinwise-accent h-7 w-7"
                                strokeWidth={2}
                                fill="rgba(212, 175, 55, 0.25)"
                            />
                            <span className="text-xl font-bold tracking-wide">COINWISE</span>
                        </a>
                        <p className="m-0 mt-5 max-w-xs text-sm leading-relaxed text-white/50">
                            Registered as a cryptoasset business with the FCA, ref 942117. The value
                            of investments can fall as well as rise.
                        </p>
                    </div>

                    <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                        {FOOTER_COLUMNS.map(column => (
                            <div key={column.title}>
                                <p className="m-0 text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">
                                    {column.title}
                                </p>
                                <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
                                    {column.links.map(link => (
                                        <li key={link}>
                                            <a
                                                href="#top"
                                                className="text-sm text-white/70 no-underline transition-colors hover:text-white"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
                    <p className="m-0 text-xs text-white/40">
                        © {new Date().getFullYear()} Coinwise Ltd. All rights reserved.
                    </p>
                    <p className="m-0 flex items-center gap-2 text-xs text-white/40">
                        <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                        />
                        All systems operational
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* -------------------------------------------------------------------------- */

export default function Coinwise() {
    const [menuOpen, setMenuOpen] = useState(false);
    const rootRef = useRef(null);
    const contextRef = useRef(null);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    /** Builds the entrance once, whichever of video-ready / timeout arrives. */
    const reveal = useCallback(() => {
        if (contextRef.current) return;

        contextRef.current = gsap.context(() => {
            gsap
                .timeline({ defaults: { duration: 1, ease: 'power3.out' } })
                .fromTo('.gsap-hero-header', { y: -40, opacity: 0 }, { y: 0, opacity: 1 }, 0.2)
                .fromTo('.gsap-hero-eyebrow', { y: 48, opacity: 0 }, { y: 0, opacity: 1 }, 0.3)
                .fromTo('.gsap-hero-heading', { y: 48, opacity: 0 }, { y: 0, opacity: 1 }, 0.4)
                .fromTo('.gsap-hero-copy', { y: 48, opacity: 0 }, { y: 0, opacity: 1 }, 0.5)
                .fromTo('.gsap-hero-actions', { y: 48, opacity: 0 }, { y: 0, opacity: 1 }, 0.6);
        }, rootRef);
    }, []);

    useEffect(() => {
        const fallback = window.setTimeout(reveal, REVEAL_FALLBACK_MS);
        return () => {
            window.clearTimeout(fallback);
            contextRef.current?.revert();
            contextRef.current = null;
        };
    }, [reveal]);

    return (
        <PageFrame title="Coinwise — Build Crypto Wealth" className="type-inter bg-coinwise-bg">
            {/* `fixed`, because the page scrolls now. */}
            <BackButton fixed top={92} left={24} />

            <div ref={rootRef}>
                <Header
                    menuOpen={menuOpen}
                    onToggleMenu={() => setMenuOpen(open => !open)}
                    onNavigate={closeMenu}
                />

                {/*
                 * The hero is its own stacking context under the sticky header.
                 * The video sits inside it rather than under `PageFrame`: for an
                 * `overflow-y: auto` element `inset-0` resolves against the
                 * scrollable padding box, so a background parked at the frame
                 * level stretches to the full height of the page.
                 */}
                <section
                    id="top"
                    className="relative flex h-[calc(100svh-5rem)] flex-col overflow-hidden"
                >
                    <VideoBackground onReady={reveal} />
                    <HeroContent />
                </section>
            </div>

            <Numbers />
            <Markets />
            <Compare />
            <Security />
            <Cta />
            <Footer />
        </PageFrame>
    );
}
