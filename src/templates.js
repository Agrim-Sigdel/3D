import PodiumHud from './screens/PodiumHud.jsx';
import ContentHub from './screens/ContentHub.jsx';
import NebulaField from './screens/NebulaField.jsx';
import VolumetricRelics from './screens/VolumetricRelics.jsx';
import StarObservatory from './screens/StarObservatory.jsx';

/**
 * The template registry. Adding a new single-page design means dropping a
 * component in ./screens and adding one entry here — the router and the index
 * page both build themselves from this list.
 */
export const TEMPLATES = [
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
];
