/**
 * The one place real content lives.
 *
 * Templates are interchangeable presentations of this data, so a new design
 * should import from here rather than retyping a bio. Anything a template
 * invents for itself (sci-fi node names, fake telemetry) stays in that
 * template — this file is only for things that are actually true.
 */

export const PROFILE = {
    name: 'Agrim Sigdel',
    initials: 'AS',
    tagline: 'Building intelligent systems that feel like magic.',
    location: 'Kathmandu, Nepal',
    availability: 'Working worldwide',
    coordinates: { lat: 27.7172, lng: 85.324 },
};

export const ROLES = [
    { label: 'Currently', title: 'Full-Stack Developer', org: 'Kingsoft Tech' },
    { label: 'Previously', title: 'Creative Lead', org: 'Prime College' },
];

export const STACK = [
    'React / Next.js / TypeScript',
    'Python / Django / FastAPI',
    'PyTorch / YOLOv8 / OpenCV',
    'PostgreSQL / Redis / Docker',
];

export const PROJECTS = [
    {
        name: 'ANPR_v2.0',
        blurb: 'Automated number plate recognition with 98% accuracy.',
    },
    {
        name: 'SENTIMENT_ANALYSIS_ENGINE',
        blurb: 'NLP model processing 5k requests/min.',
    },
];

export const SOCIALS = [
    { label: 'GitHub', href: 'https://github.com/Agrim-Sigdel' },
    { label: 'LinkedIn', href: '#linkedin' },
];

/** "27.7172° N / 85.3240° E" — used by the HUD chrome in several templates. */
export const formatCoordinates = () => {
    const { lat, lng } = PROFILE.coordinates;
    return `${lat.toFixed(4)}° N / ${lng.toFixed(4)}° E`;
};
