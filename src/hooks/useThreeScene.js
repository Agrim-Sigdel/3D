import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Owns the boilerplate every scene needs: renderer, canvas mount, resize
 * handling, the animation loop, and teardown.
 *
 * The setup callback receives { scene, camera, renderer, mount } and returns
 * either a frame callback, or an object:
 *
 *   {
 *     frame(ctx)    called once per rAF tick with { time, delta, scene,
 *                   camera, renderer }. Rendering is done for you afterwards;
 *                   return false to skip the draw for that tick.
 *     resize(ctx)   called after the camera and renderer have been resized,
 *                   for anything layout-dependent.
 *     dispose()     called before the built-in teardown.
 *   }
 *
 * Teardown cancels the frame, runs your dispose, walks the scene disposing
 * geometries and materials, disposes the renderer and detaches the canvas.
 * That ordering is the point of the hook: getting it wrong leaks a canvas and
 * a live rAF loop per mount, which is exactly what several of these screens
 * used to do.
 *
 * `setup` is called once. Read changing React state from a ref inside `frame`
 * rather than adding it to `deps`, or you rebuild the whole scene on every
 * interaction.
 */
export function useThreeScene(setup, options = {}, deps = []) {
    const mountRef = useRef(null);

    // Keep the latest setup without making it a dependency; the scene is
    // rebuilt only when `deps` says so.
    const setupRef = useRef(setup);
    setupRef.current = setup;

    const {
        alpha = true,
        antialias = true,
        powerPreference,
        maxPixelRatio = 2,
        cameraFov = 50,
        cameraNear = 0.1,
        cameraFar = 5000,
        background = null,
        toneMapping = null,
        toneMappingExposure = 1,
    } = options;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        if (background !== null) scene.background = new THREE.Color(background);

        const camera = new THREE.PerspectiveCamera(cameraFov, width / height, cameraNear, cameraFar);

        const renderer = new THREE.WebGLRenderer({
            antialias,
            alpha,
            ...(powerPreference ? { powerPreference } : {}),
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
        if (toneMapping !== null) {
            renderer.toneMapping = toneMapping;
            renderer.toneMappingExposure = toneMappingExposure;
        }
        mount.appendChild(renderer.domElement);

        const handle = setupRef.current({ scene, camera, renderer, mount }) ?? {};
        const { frame, resize, dispose } = typeof handle === 'function' ? { frame: handle } : handle;

        const onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            resize?.({ width: w, height: h, scene, camera, renderer });
        };
        window.addEventListener('resize', onResize);
        onResize();

        const clock = new THREE.Clock();
        let frameId;
        const tick = () => {
            frameId = requestAnimationFrame(tick);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();
            // A frame callback returning false means "nothing to draw" — used
            // when an opaque overlay is covering the canvas.
            if (frame?.({ time, delta, scene, camera, renderer }) === false) return;
            renderer.render(scene, camera);
        };
        tick();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', onResize);
            dispose?.();

            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
                }
            });
            renderer.dispose();
            renderer.domElement.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return mountRef;
}

/**
 * Mirrors React state into a ref so the render loop can read current values
 * without being rebuilt when they change.
 */
export function useLatest(value) {
    const ref = useRef(value);
    useEffect(() => { ref.current = value; }, [value]);
    return ref;
}
