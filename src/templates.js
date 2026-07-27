import PodiumHud from './screens/playground/PodiumHud.jsx';
import ContentHub from './screens/playground/ContentHub.jsx';
import NebulaField from './screens/playground/NebulaField.jsx';
import VolumetricRelics from './screens/playground/VolumetricRelics.jsx';
import StarObservatory from './screens/playground/StarObservatory.jsx';

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
        items: [],
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
