import React from 'react';
import { ChromaFlow, FilmGrain, FlutedGlass, Shader, Swirl } from 'shaders/react';

/**
 * Axion's animated backdrop: four shader nodes composed into one WebGPU canvas.
 *
 * Kept in its own module so `Axion.jsx` can pull it in with `React.lazy`. The
 * `shaders` engine is ~680 kB minified, and this is the only screen in the
 * library that wants it — imported directly it would land in the entry chunk and
 * be paid for by the index page and all twenty-odd other templates. Behind a lazy
 * boundary it becomes a chunk that is fetched when this one hero mounts.
 *
 * Composition is by nesting, which is how the package models a layer tree: Swirl
 * lays down the off-white ground, ChromaFlow pushes orange through it,
 * FlutedGlass refracts what is beneath, and FilmGrain sits on top of the lot.
 *
 * Telemetry is off. The package phones home by default, and a template in a local
 * library has no business reporting anything about who opened it.
 *
 * Note the licence — see the header of `../Axion.jsx`. Free for personal and
 * evaluation use only; commercial or public-facing use needs a paid seat.
 */

export default function ShaderBackdrop({ onUnavailable }) {
    return (
        <Shader
            className="pointer-events-none absolute inset-0 z-10"
            disableTelemetry
            onUnavailable={onUnavailable}
        >
            <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7}>
                <ChromaFlow
                    baseColor="#ffffff"
                    downColor="#ff5f03"
                    leftColor="#ff5f03"
                    rightColor="#ff5f03"
                    upColor="#ff5f03"
                    momentum={13}
                    radius={3.5}
                >
                    <FlutedGlass
                        aberration={0.61}
                        angle={31}
                        frequency={8}
                        highlight={0.12}
                        highlightSoftness={0}
                        lightAngle={-90}
                        refraction={4}
                        shape="rounded"
                        softness={1}
                        speed={0.15}
                    >
                        <FilmGrain strength={0.05} />
                    </FlutedGlass>
                </ChromaFlow>
            </Swirl>
        </Shader>
    );
}
