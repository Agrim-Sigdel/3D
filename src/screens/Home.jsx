import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../templates.js';

function TemplateCard({ categorySlug, item, index }) {
  return (
    <Link
      to={`/${categorySlug}/${item.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
      />
      <div className="mb-5 flex items-center justify-between">
        <span
          className="block h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150"
          style={{ backgroundColor: item.accent, boxShadow: `0 0 12px ${item.accent}` }}
        />
        <span className="font-mono text-[10px] tabular-nums text-white/20">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="m-0 text-lg font-bold tracking-tight text-white">{item.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-white/35">{item.tagline}</p>
      <span className="mt-6 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
        /{categorySlug}/{item.slug}
      </span>
    </Link>
  );
}

function Category({ category }) {
  const { slug, name, blurb, accent, items, emptyHint } = category;

  return (
    <section className="mb-20">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-white/10 pb-4">
        <h2 className="m-0 flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: accent, boxShadow: `0 0 14px ${accent}` }}
          />
          {name}
        </h2>
        <p className="m-0 text-xs text-white/35">{blurb}</p>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
          {items.length} {items.length === 1 ? 'screen' : 'screens'}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <TemplateCard key={item.slug} categorySlug={slug} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <p className="m-0 text-sm text-white/40">Nothing here yet.</p>
          <p className="mx-auto mt-2 max-w-md font-mono text-[11px] leading-relaxed text-white/20">
            {emptyHint}
          </p>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const total = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-[#08080b] px-6 py-16 text-white md:px-12 md:py-24">
      <header className="mx-auto mb-16 max-w-5xl">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.5em] text-white/30">
          Template Library
        </p>
        <h1 className="m-0 text-4xl font-black tracking-tight md:text-6xl">
          Three.js single-page designs
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/40">
          {total} self-contained scenes across {CATEGORIES.length} groups. Each one is a
          full-viewport page you can lift into a project on its own.
        </p>
      </header>

      <div className="mx-auto max-w-5xl">
        {CATEGORIES.map(category => (
          <Category key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
}
