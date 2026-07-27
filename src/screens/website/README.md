# 3D Website

Full single-page sites — a scene with an actual site built on top of it, as
opposed to the scene-only experiments in `../playground`.

## Adding one

1. Drop the component in this folder, e.g. `Aurora.jsx`. Default-export a
   component that renders a full-viewport page (`fixed inset-0`).

2. Register it in `src/templates.js` under the `website` category:

   ```js
   import Aurora from './screens/website/Aurora.jsx';

   // ...inside the website category's items array:
   {
       slug: 'aurora',
       name: 'Aurora',
       tagline: 'One line describing the design',
       accent: '#a78bfa',
       component: Aurora,
   }
   ```

   It appears at `/website/aurora` and on the index page automatically.

## Building the scene

Use `useThreeScene` — it owns the renderer, canvas mount, resize handling, the
animation loop and teardown, so a template only describes its own scene:

```jsx
import * as THREE from 'three';
import { useThreeScene, useLatest } from '../../hooks/useThreeScene.js';

export default function Aurora() {
    const [activeIdx, setActiveIdx] = useState(0);

    // Mirror state the loop needs to read. Putting activeIdx in `deps` instead
    // would rebuild the entire scene on every change.
    const state = useLatest({ activeIdx });

    const mountRef = useThreeScene(({ scene, camera }) => {
        camera.position.set(0, 0, 20);
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        const mesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(4, 1),
            new THREE.MeshStandardMaterial({ color: 0xa78bfa })
        );
        scene.add(mesh);

        const onMove = e => { /* ... */ };
        window.addEventListener('mousemove', onMove);

        return {
            frame: ({ time, delta }) => {
                mesh.rotation.y += delta;
                // return false to skip the draw this tick
            },
            resize: ({ width }) => { /* layout that depends on viewport */ },
            dispose: () => window.removeEventListener('mousemove', onMove),
        };
    }, { background: 0x08080b, cameraFov: 50 }, []);

    return <div className="fixed inset-0"><div ref={mountRef} className="absolute inset-0" /></div>;
}
```

Options: `background`, `alpha`, `antialias`, `powerPreference`,
`maxPixelRatio`, `cameraFov`, `cameraNear`, `cameraFar`, `toneMapping`,
`toneMappingExposure`.

The hook exists because each of these was a real bug in the playground screens:
a canvas and a live `requestAnimationFrame` loop leaked per interaction, GPU
buffers were never freed, and cleanup read a ref React had already cleared.
Going through the hook means you cannot reintroduce them.

Two rules it can't enforce for you:

- **Never call `setState` inside `frame`** — that re-renders at 60fps. Write
  per-frame values straight to the DOM (see how `NebulaField` positions its
  labels).
- **Never call `Math.random()` during render** — React 19 flags it, and values
  visibly flicker. Roll them once at module scope.

## What to reuse

- `../BackButton` — the corner back control every screen carries.
- `../../data/portfolio.js` — bio, roles, stack, projects. Import real content
  from here rather than retyping it; keep invented flavour text local to the
  component.
