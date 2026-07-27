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

## What to reuse

- `../BackButton` — the corner back control every screen carries.
- `../../data/portfolio.js` — bio, roles, stack, projects. Import real content
  from here rather than retyping it; keep invented flavour text local to the
  component.

## Scene checklist

The templates in `../playground` all follow this shape, and it exists because
each item on the list was a bug at some point:

- Capture the mount node once (`const mount = mountRef.current`) — reading
  `mountRef.current` inside cleanup gets you a stale value.
- Store the `requestAnimationFrame` id and pass *that* to
  `cancelAnimationFrame`, not the callback.
- Build the scene once. Read changing state from a ref inside the loop instead
  of adding it to the effect's dependencies, or you rebuild the renderer on
  every interaction.
- In cleanup: cancel the frame, remove listeners, dispose geometries and
  materials, dispose the renderer, then `renderer.domElement.remove()`.
- Never call `setState` from inside the render loop — that re-renders at 60fps.
  Write to the DOM directly for per-frame values.
- Never call `Math.random()` during render; roll values once in module scope.
