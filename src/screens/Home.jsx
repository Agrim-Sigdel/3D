import React from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES } from '../templates.js';

export default function Home() {
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
          {TEMPLATES.length} self-contained scenes. Each one is a full-viewport page you can
          lift into a project on its own.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map(({ slug, name, tagline, accent }) => (
          <Link
            key={slug}
            to={`/t/${slug}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
          >
            <span
              className="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />
            <span
              className="mb-5 block h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150"
              style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
            />
            <h2 className="m-0 text-lg font-bold tracking-tight text-white">{name}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-white/35">{tagline}</p>
            <span className="mt-6 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
              /t/{slug}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
