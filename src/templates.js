import PodiumHud from './screens/playground/PodiumHud.jsx';
import ContentHub from './screens/playground/ContentHub.jsx';
import NebulaField from './screens/playground/NebulaField.jsx';
import VolumetricRelics from './screens/playground/VolumetricRelics.jsx';
import StarObservatory from './screens/playground/StarObservatory.jsx';
import Axon from './screens/website/Axon.jsx';
import Prisma from './screens/website/Prisma.jsx';
import Wandor from './screens/website/Wandor.jsx';
import Jack from './screens/website/Jack.jsx';
import Measured from './screens/website/Measured.jsx';
import Adam from './screens/website/Adam.jsx';
import Lithos from './screens/website/Lithos.jsx';
import Vex from './screens/website/Vex.jsx';
import Aster from './screens/website/Aster.jsx';
import Asme from './screens/website/Asme.jsx';
import Orbis from './screens/website/Orbis.jsx';
import KnowItAll from './screens/website/KnowItAll.jsx';
import Vortx from './screens/website/Vortx.jsx';
import MichaelSmith from './screens/website/MichaelSmith.jsx';
import Securify from './screens/website/Securify.jsx';
import Axion from './screens/website/Axion.jsx';
import Verde from './screens/website/Verde.jsx';
import NaturaVista from './screens/website/NaturaVista.jsx';
import Coinwise from './screens/website/Coinwise.jsx';
import Skyline from './screens/website/Skyline.jsx';
import Outbox from './screens/website/Outbox.jsx';
import WanderGear from './screens/website/WanderGear.jsx';
import Mindful from './screens/website/Mindful.jsx';
import Basilico from './screens/website/Basilico.jsx';
import Marlowe from './screens/website/Marlowe.jsx';
import Aluma from './screens/website/Aluma.jsx';

/**
 * The template registry, in two groups.
 *
 *   playground  Experiments — one scene, one idea, no site around it.
 *   website     Full single-page sites built on top of a scene.
 *
 * Adding a design means dropping a component in the matching folder under
 * ./screens and adding an entry to that category's `items`. The router and
 * the index page both build themselves from this file, so there is nothing
 * else to wire up.
 */

export const CATEGORIES = [
    {
        slug: 'playground',
        name: '3D Playground',
        blurb: 'Scenes and interaction experiments.',
        accent: '#00f2ff',
        items: [
            {
                slug: 'podium-hud',
                name: 'Podium HUD',
                tagline: 'Three holographic podiums on a grid',
                accent: '#00f2ff',
                component: PodiumHud,
                props: { theme: 'dark' },
            },
            {
                slug: 'podium-hud-light',
                name: 'Podium HUD — Light',
                tagline: 'The same stage, daylit and glassy',
                accent: '#0099cc',
                component: PodiumHud,
                props: { theme: 'light', podium: 'strips' },
            },
            {
                slug: 'content-hub',
                name: 'Content Hub',
                tagline: 'Podium hub that opens into real pages',
                accent: '#64ffda',
                component: ContentHub,
            },
            {
                slug: 'nebula-field',
                name: 'Nebula Field',
                tagline: 'Drift between shards over a lava sea',
                accent: '#ff4500',
                component: NebulaField,
            },
            {
                slug: 'volumetric-relics',
                name: 'Volumetric Relics',
                tagline: 'Simplex clouds and a GPU energy current',
                accent: '#00f3ff',
                component: VolumetricRelics,
            },
            {
                slug: 'star-observatory',
                name: 'Star Observatory',
                tagline: 'Faceted stars in a magenta nebula',
                accent: '#f472b6',
                component: StarObservatory,
            },
        ],
    },
    {
        slug: 'website',
        name: '3D Website',
        blurb: 'Complete single-page sites.',
        accent: '#a78bfa',
        emptyHint: 'Drop a component in src/screens/website/ and add it to the website category in src/templates.js.',
        items: [
            {
                slug: 'jack',
                name: 'Jack',
                tagline: 'Five-section 3D creator portfolio, magnetic portrait',
                accent: '#bbccd7',
                component: Jack,
            },
            {
                slug: 'prisma',
                name: 'Prisma',
                tagline: 'Cinematic studio site with grain and word reveals',
                accent: '#dedbc8',
                component: Prisma,
            },
            {
                slug: 'measured',
                name: 'Measured',
                tagline: 'Cursor spotlight reveals a video through the still',
                accent: '#4ade80',
                component: Measured,
            },
            {
                slug: 'wandor',
                name: 'Wandor',
                tagline: 'Travel hero built around a liquid-glass prompt card',
                accent: '#905831',
                component: Wandor,
            },
            {
                slug: 'axon',
                name: 'Axon',
                tagline: 'Light SaaS hero over a top-anchored video bleed',
                accent: '#1b133c',
                component: Axon,
            },
            {
                slug: 'michael-smith',
                name: 'Michael Smith',
                tagline: 'Seven sections: loader, bento works, 300vh parallax gallery',
                accent: '#89aacc',
                component: MichaelSmith,
            },
            {
                slug: 'orbis',
                name: 'Orbis.Nft',
                tagline: 'Anton and neon over four video sections, grain on top',
                accent: '#6fff00',
                component: Orbis,
            },
            {
                slug: 'lithos',
                name: 'Lithos',
                tagline: 'Cursor spotlight reveals a second image through the first',
                accent: '#e8702a',
                component: Lithos,
            },
            {
                // `axion-studio`, not `axion`, so the route is not one letter
                // away from `axon` above.
                slug: 'axion-studio',
                name: 'Axion Studio',
                tagline: 'Live WebGPU shader stack behind a light agency site',
                accent: '#f26522',
                component: Axion,
            },
            {
                slug: 'aster',
                name: 'Aster',
                tagline: 'Space travel in two acts, videos crossfading at the loop',
                accent: '#c8d4e6',
                component: Aster,
            },
            {
                slug: 'know-it-all',
                name: 'Know It All',
                tagline: 'Five held frames under a glass newsletter hero',
                accent: '#ffffff',
                component: KnowItAll,
            },
            {
                slug: 'adam',
                name: 'Adam Roberts',
                tagline: 'Locked viewport where a bitmap face answers Inter',
                accent: '#ef4444',
                component: Adam,
            },
            {
                slug: 'securify',
                name: 'Securify',
                tagline: 'Three giant words stepped down the frame in vw units',
                accent: '#e5e5e5',
                component: Securify,
            },
            {
                slug: 'vortx',
                name: 'VortxLab',
                tagline: 'Octagonal clip-path chrome, eight staggered entrances',
                accent: '#a3a3a3',
                component: Vortx,
            },
            {
                slug: 'vex',
                name: 'Vex',
                tagline: 'Headline assembled character by character on dark glass',
                accent: '#d4d4d4',
                component: Vex,
            },
            {
                slug: 'asme',
                name: 'Asme',
                tagline: 'One locked viewport: serif headline over a fading loop',
                accent: '#f5f5f5',
                component: Asme,
            },
            {
                slug: 'verde',
                name: 'Verde',
                tagline: 'Bounded video card with a concave fillet cut into it',
                accent: '#4a7c59',
                component: Verde,
            },
            {
                slug: 'natura-vista',
                name: 'NaturaVista',
                tagline: 'Two copies of one clip, crossfading at half speed',
                accent: '#5eead4',
                component: NaturaVista,
            },
            {
                slug: 'coinwise',
                name: 'Coinwise',
                tagline: 'Gold on off-white, uncovered by a GSAP timeline',
                accent: '#d4af37',
                component: Coinwise,
            },
            {
                slug: 'skyline',
                name: 'Skyline',
                tagline: 'A 300vh circle opens a sketched city onto the real one',
                accent: '#00f0ff',
                component: Skyline,
            },
            {
                slug: 'outbox',
                name: 'Outbox',
                tagline: 'Four discs grow out of the O and swallow the page',
                accent: '#f24d29',
                component: Outbox,
            },
            {
                // `wander-gear`, not `wander` — one letter from `wandor` above,
                // which is a different template entirely.
                slug: 'wander-gear',
                name: 'Wander Gear',
                tagline: 'Masked hero video and two corners that curve inward',
                accent: '#d9772b',
                component: WanderGear,
            },
            {
                slug: 'mindful',
                name: 'Mindful',
                tagline: 'Three stacked overlays hold type over a dark loop',
                accent: '#e2b05c',
                component: Mindful,
            },
            {
                // Assembled from CATALOGUE.md rather than written from a brief,
                // and the only template whose copy lives outside its component
                // (src/data/aluma.json).
                slug: 'aluma',
                name: 'Aluma',
                tagline: 'Resort site composed from the catalogue, copy from JSON',
                accent: '#3c6e6a',
                component: Aluma,
            },
            {
                slug: 'basilico',
                name: 'Basilico',
                tagline: 'Ten sections of black and gold, with a dot for a cursor',
                accent: '#d9a35f',
                component: Basilico,
            },
            {
                slug: 'marlowe',
                name: 'Marlowe & Hale',
                tagline: 'A Savile Row tailor whose cloth is drawn rather than shot',
                accent: '#c0a05a',
                component: Marlowe,
            },
        ],
    },
];

/** Flattened for routing: [{ path, component, props }]. */
export const ROUTES = CATEGORIES.flatMap(category =>
    category.items.map(item => ({
        path: `/${category.slug}/${item.slug}`,
        component: item.component,
        props: item.props,
        key: `${category.slug}-${item.slug}`,
    }))
);
