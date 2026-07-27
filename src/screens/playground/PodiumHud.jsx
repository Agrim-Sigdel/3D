import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useThreeScene } from '../../hooks/useThreeScene.js';
import BackButton from '../BackButton';
import { PROFILE, formatCoordinates } from '../../data/portfolio.js';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PODIUM HUD
 *
 * Three podiums on a grid, each carrying a holographic panel. Hovering
 * raycasts onto the panel and drives the detail card; clicking runs a boot
 * sequence.
 *
 * Two axes of variation:
 *   theme     'dark' | 'light'                — palette, blending, chrome
 *   podium    'diamond' | 'pillar' | 'strips' — the geometry on each base
 */

const THEMES = {
    dark: {
        bg: 0x000b14,
        fogDensity: 0.04,
        accents: { fun: 0x00f2ff, work: 0xffcc00, normal: 0xaa00ff },
        accentsCss: { fun: '#00f2ff', work: '#ffcc00', normal: '#aa00ff' },
        grid: 0x002233,
        gridLine: 0x00f2ff,
        gridOpacity: 0.1,
        particle: 0xffffff,
        particleOpacity: 0.2,
        particleCount: 1000,
        blending: THREE.AdditiveBlending,
        ambient: { color: 0x404040, intensity: 1.5 },
        spot: 3,
        baseMaterial: { color: 0x020202, roughness: 0.1, metalness: 0.9 },
        transparentBackground: true,
    },
    light: {
        bg: 0xf4f7f6,
        fogDensity: 0.04,
        accents: { fun: 0x0099cc, work: 0xd4a017, normal: 0x8a2be2 },
        accentsCss: { fun: '#0099cc', work: '#d4a017', normal: '#8a2be2' },
        grid: 0xcccccc,
        gridLine: 0xcccccc,
        gridOpacity: 0.3,
        particle: 0x2d3748,
        particleOpacity: 0.25,
        particleCount: 1500,
        blending: THREE.NormalBlending,
        ambient: { color: 0x444444, intensity: 1.8 },
        spot: 4,
        baseMaterial: { color: 0x2a303c, roughness: 0.5, metalness: 0.6 },
        transparentBackground: false,
    },
};

const MODULES = [
    {
        id: 'fun',
        name: 'CREATIVE',
        code: 'CX-9',
        title: 'Fun Mode',
        description: 'Interactive animations, playful physics, and experimental design.',
        features: ['Smooth Animations', 'Interactive Elements', 'Modern UI'],
        x: -6,
    },
    {
        id: 'work',
        name: 'TERMINAL',
        code: 'TX-1',
        title: 'Work Mode',
        description: 'Professional command-line interface with developer tools.',
        features: ['Terminal Commands', 'Efficient Navigation', 'Project Logs'],
        x: 0,
    },
    {
        id: 'normal',
        name: 'CLASSIC',
        code: 'CL-4',
        title: 'Normal Mode',
        description: 'A clean, high-performance, and straightforward layout.',
        features: ['Simple Design', 'Fast Loading', 'Intuitive UI'],
        x: 6,
    },
];

const PODIUM_ORDER = ['diamond', 'pillar', 'strips'];

/**
 * Position-space hologram, for solid volumes like the octahedron. Fresnel rim
 * plus a vertical scan bar, so the effect reads from any angle.
 */
const volumeShader = (color, blending) =>
    new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(color) },
            opacity: { value: 0.15 },
            hover: { value: 0.0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending,
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float opacity;
            uniform float hover;
            varying vec3 vNormal;
            varying vec3 vPosition;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main() {
                vec3 viewDir = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);

                float grid = step(0.97, fract(vPosition.x * 5.0)) + step(0.97, fract(vPosition.y * 5.0));
                float scan = step(abs(vPosition.y - sin(time * 0.8) * 2.0), 0.1) * random(vec2(vPosition.x, time));
                float flicker = 0.9 + 0.2 * random(vec2(time, 1.0));

                float alpha = opacity + hover * (fresnel * 0.4 + scan * 0.5 + grid * 0.1);
                gl_FragColor = vec4(color + (hover * scan * 0.4), alpha * flicker);
            }
        `,
    });

/**
 * UV-space hologram, for flat panels. Scanning beam and static noise with an
 * edge falloff so the card fades out rather than ending on a hard rectangle.
 */
const panelShader = (color, blending) =>
    new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(color) },
            opacity: { value: 0.1 },
            hover: { value: 0.0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float opacity;
            uniform float hover;
            varying vec2 vUv;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main() {
                float grid = (sin(vUv.x * 50.0) * 0.5 + 0.5) * (sin(vUv.y * 50.0) * 0.5 + 0.5);
                float staticNoise = random(vUv + time * 0.01);

                float beamY = mod(time * 0.3, 1.0);
                float beamStatic = step(abs(vUv.y - beamY), 0.05) * random(vec2(vUv.x * 20.0, time));
                float flicker = random(vec2(time, 0.0)) > 0.95 ? 1.5 : 1.0;

                float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0) * pow(1.0 - abs(vUv.y - 0.5) * 2.0, 3.0);

                float alpha = opacity + hover * (grid * 0.05 + beamStatic * 0.5 + staticNoise * 0.1 * flicker);
                gl_FragColor = vec4(color + hover * beamStatic * 0.3, alpha * (edge + 0.1) * flicker);
            }
        `,
    });

/** Faceted octahedron floating above a round plinth. */
function buildDiamond(accent, theme) {
    const group = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial(theme.baseMaterial);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 0.4, 32), metal);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.5, 2.5, 32), metal);
    stem.position.y = 1.4;

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.06, 16, 64),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.65;

    const target = new THREE.Mesh(new THREE.OctahedronGeometry(1.8, 0), volumeShader(accent, theme.blending));
    target.scale.set(1.1, 1.6, 1.1);
    target.position.y = 5.2;

    group.add(base, stem, ring, target);
    return { group, target, spin: [ring] };
}

/** Octagonal column with a holographic card hovering over it. */
function buildPillar(accent, theme) {
    const group = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, 0.5, 8),
        new THREE.MeshStandardMaterial(theme.baseMaterial)
    );
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.6, 3, 8),
        new THREE.MeshStandardMaterial({ ...theme.baseMaterial, emissive: accent, emissiveIntensity: 0.02 })
    );
    body.position.y = 1.75;

    const target = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.8), panelShader(accent, theme.blending));
    target.position.y = 6.2;

    group.add(base, body, target);
    return { group, target, spin: [], emissive: body };
}

/** Column ringed by vertical light strips, twin rotating rings and a scanner. */
function buildStrips(accent, theme) {
    const group = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, 0.5, 8),
        new THREE.MeshStandardMaterial(theme.baseMaterial)
    );
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.6, 3, 8),
        new THREE.MeshStandardMaterial({ ...theme.baseMaterial, emissive: accent, emissiveIntensity: 0.15 })
    );
    body.position.y = 1.75;
    group.add(base, body);

    const ringGeo = new THREE.TorusGeometry(1.45, 0.05, 8, 50);
    const ringMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.6 });
    const ringLow = new THREE.Mesh(ringGeo, ringMat);
    ringLow.rotation.x = Math.PI / 2;
    ringLow.position.y = 0.8;
    const ringHigh = ringLow.clone();
    ringHigh.position.y = 2.6;
    ringHigh.scale.setScalar(0.85);
    group.add(ringLow, ringHigh);

    const stripGeo = new THREE.BoxGeometry(0.06, 2.8, 0.12);
    const stripMat = new THREE.MeshBasicMaterial({ color: accent });
    for (let i = 0; i < 8; i++) {
        const strip = new THREE.Mesh(stripGeo, stripMat);
        const angle = (i / 8) * Math.PI * 2;
        strip.position.set(Math.cos(angle) * 1.35, 1.75, Math.sin(angle) * 1.35);
        strip.lookAt(0, 1.75, 0);
        group.add(strip);
    }

    const scanner = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.025, 16, 100),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8 })
    );
    scanner.position.y = 3.6;
    scanner.rotation.x = Math.PI / 2;
    group.add(scanner);

    const target = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.8), panelShader(accent, theme.blending));
    target.position.y = 6.2;
    group.add(target);

    return { group, target, spin: [ringLow, ringHigh], scanner, emissive: body };
}

const BUILDERS = { diamond: buildDiamond, pillar: buildPillar, strips: buildStrips };

export default function PodiumHud({ theme: themeName = 'dark', podium: initialPodium = 'diamond' }) {
    const [podium, setPodium] = useState(initialPodium);
    const [hoveredModule, setHoveredModule] = useState(MODULES[1]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [isSwitching, setIsSwitching] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString());

    const theme = THEMES[themeName] ?? THEMES.dark;
    const activeColor = theme.accentsCss[hoveredModule?.id] ?? theme.accentsCss.fun;

    const stateRef = useRef({
        activeIndex: 1,
        isSwitching: false,
        mouse: new THREE.Vector2(),
        raycaster: new THREE.Raycaster(),
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleModuleSelect = useCallback((modeId) => {
        if (stateRef.current.isSwitching) return;

        setSelectedModule(MODULES.find(m => m.id === modeId));
        setIsSwitching(true);
        stateRef.current.isSwitching = true;

        setTimeout(() => {
            setIsSwitching(false);
            stateRef.current.isSwitching = false;
            setSelectedModule(null);
        }, 2500);
    }, []);

    const mountRef = useThreeScene(({ scene, camera }) => {
        const isMobile = window.innerWidth < 768;

        scene.fog = new THREE.FogExp2(theme.bg, theme.fogDensity);
        camera.position.set(0, isMobile ? 8 : 6, isMobile ? 25 : 20);

        scene.add(new THREE.AmbientLight(theme.ambient.color, theme.ambient.intensity));

        const spot = new THREE.SpotLight(0xffffff, theme.spot);
        spot.position.set(0, 25, 15);
        spot.angle = Math.PI / 4;
        spot.penumbra = 0.5;
        scene.add(spot);

        const grid = new THREE.GridHelper(60, 60, theme.gridLine, theme.grid);
        grid.position.y = -4;
        grid.material.transparent = true;
        grid.material.opacity = theme.gridOpacity;
        scene.add(grid);

        const partGeo = new THREE.BufferGeometry();
        const partPos = new Float32Array(theme.particleCount * 3);
        for (let i = 0; i < partPos.length; i++) partPos[i] = (Math.random() - 0.5) * 60;
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(
            partGeo,
            new THREE.PointsMaterial({
                size: 0.04,
                color: theme.particle,
                transparent: true,
                opacity: theme.particleOpacity,
            })
        );
        scene.add(particles);

        const build = BUILDERS[podium] ?? BUILDERS.diamond;
        const podiums = MODULES.map((mod, i) => {
            const accent = theme.accents[mod.id];
            const built = build(accent, theme);

            built.group.position.set(mod.x, -4, 0);
            built.group.userData = { id: mod.id, index: i };
            built.target.userData = { index: i };

            const light = new THREE.PointLight(accent, 0.2, 10);
            light.position.y = 5;
            built.group.add(light);

            scene.add(built.group);
            return { ...built, light, mod };
        });

        const targets = podiums.map(p => p.target);

        const onMouseMove = (e) => {
            stateRef.current.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            stateRef.current.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const onClick = () => {
            const { raycaster, mouse } = stateRef.current;
            raycaster.setFromCamera(mouse, camera);
            const hit = raycaster.intersectObjects(targets)[0];
            if (hit) handleModuleSelect(MODULES[hit.object.userData.index].id);
        };

        // Podiums pull inward on narrow viewports.
        const layout = ({ width }) => {
            podiums.forEach((p, i) => {
                p.group.position.x = width < 768 ? MODULES[i].x * 0.7 : MODULES[i].x;
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        const frame = ({ time }) => {
            const { raycaster, mouse } = stateRef.current;

            particles.rotation.y += 0.0002;

            raycaster.setFromCamera(mouse, camera);
            const hit = raycaster.intersectObjects(targets)[0];
            if (hit) {
                const idx = hit.object.userData.index;
                if (stateRef.current.activeIndex !== idx) {
                    stateRef.current.activeIndex = idx;
                    setHoveredModule(MODULES[idx]);
                }
            }

            podiums.forEach((p, i) => {
                const isActive = i === stateRef.current.activeIndex;

                p.group.position.y = -4 + Math.sin(time * 1.2 + i) * 0.1;

                p.target.material.uniforms.time.value = time;
                p.target.material.uniforms.hover.value = THREE.MathUtils.lerp(
                    p.target.material.uniforms.hover.value,
                    isActive ? 1.0 : 0.0,
                    0.1
                );

                if (podium === 'diamond') {
                    p.target.rotation.y += isActive ? 0.02 : 0.005;
                } else {
                    p.target.position.y = 6.2 + Math.sin(time * 2 + i) * 0.15;
                }

                p.spin.forEach((ring, ri) => {
                    ring.rotation.z += 0.01 * (ri + 1);
                });

                if (p.scanner) {
                    p.scanner.rotation.z -= 0.025;
                    p.scanner.rotation.x = Math.PI / 2 + Math.sin(time * 1.5) * 0.08;
                }

                if (p.emissive) {
                    p.emissive.material.emissiveIntensity = THREE.MathUtils.lerp(
                        p.emissive.material.emissiveIntensity,
                        isActive ? 0.4 : 0.02,
                        0.1
                    );
                }

                p.light.intensity = THREE.MathUtils.lerp(p.light.intensity, isActive ? 2.0 : 0.2, 0.1);
                const scale = isActive ? 1.1 : 1.0;
                p.group.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
            });

            camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 2, 0.05);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, (isMobile ? 8 : 6) + mouse.y, 0.05);
            camera.lookAt(0, 2.5, 0);
        };

        return {
            frame,
            resize: layout,
            dispose: () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('click', onClick);
            },
        };
    }, {
        background: theme.transparentBackground ? null : theme.bg,
        cameraFov: 45,
        cameraFar: 1000,
    }, [handleModuleSelect, podium, theme]);

    return (
        <div className={`podium-hud podium-hud--${themeName}`} style={{ '--active-color': activeColor }}>
            <BackButton />
            <div className="vignette" />
            <div className="scanline" />

            <div ref={mountRef} className="canvas-container" />

            <div className="ui-layer">
                <div className="top-nav">
                    <motion.div className="header-hud" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="brand-label">OPERATING SYSTEM</span>
                        <h1>{PROFILE.name.toUpperCase()} v3.5</h1>
                        <div className="header-line" />
                    </motion.div>

                    <motion.div className="view-toggle-hud" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="toggle-label">RENDER_ENGINE</span>
                        <div className="toggle-buttons">
                            {PODIUM_ORDER.map(name => (
                                <button
                                    key={name}
                                    className={`toggle-btn ${podium === name ? 'active' : ''}`}
                                    onClick={() => setPodium(name)}
                                >
                                    {name.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {hoveredModule && !isSwitching && (
                        <motion.div
                            key={hoveredModule.id}
                            className="cyber-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="card-top-accent" />
                            <div className="card-content">
                                <div className="card-meta">
                                    <span className="id-code">{hoveredModule.code}</span>
                                    <span className="category">{hoveredModule.name}</span>
                                </div>
                                <h2 className="card-title">{hoveredModule.title}</h2>
                                <p className="card-desc">{hoveredModule.description}</p>
                                <div className="feature-list">
                                    {hoveredModule.features.map(f => (
                                        <div key={f} className="feature-item">
                                            <div className="feature-dot" />
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card-action">CLICK OBJECT TO INITIALIZE</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="footer-hud">
                    <div className="sys-log">
                        <div>NET_UP: {formatCoordinates()}</div>
                        <div className="status-blink">
                            <span className="dot" /> MODE: {podium.toUpperCase()}
                        </div>
                    </div>
                    <div className="time-box">{currentTime}</div>
                </div>
            </div>

            <AnimatePresence>
                {isSwitching && (
                    <motion.div
                        className="transition-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="loading-wrap">
                            <div className="glitch-text">BOOTING_{selectedModule?.id.toUpperCase()}</div>
                            <div className="load-bar">
                                <div className="load-fill" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .podium-hud {
                    position: fixed; inset: 0;
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    color: var(--active-color);
                    overflow: hidden; touch-action: none;
                }

                .podium-hud--dark {
                    --surface: rgba(0, 5, 10, 0.9);
                    --border: rgba(255, 255, 255, 0.1);
                    --heading: #fff;
                    --muted: rgba(255, 255, 255, 0.5);
                    --overlay: #000;
                    background: #000b14;
                }
                .podium-hud--light {
                    --surface: rgba(255, 255, 255, 0.85);
                    --border: rgba(0, 0, 0, 0.1);
                    --heading: #2d3748;
                    --muted: #718096;
                    --overlay: rgba(244, 247, 246, 0.92);
                    background: #f4f7f6;
                    cursor: crosshair;
                }

                .podium-hud--dark .vignette {
                    background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.9) 100%);
                }
                .podium-hud--light .vignette {
                    background: radial-gradient(circle, transparent 30%, rgba(255,255,255,0.6) 100%);
                }
                .vignette { position: absolute; inset: 0; pointer-events: none; z-index: 2; }

                .podium-hud--light .scanline { display: none; }
                .scanline {
                    position: absolute; inset: 0; z-index: 100; pointer-events: none;
                    background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%);
                    background-size: 100% 4px; opacity: 0.15;
                }

                .canvas-container { position: absolute; inset: 0; }

                .ui-layer {
                    position: absolute; inset: 0; z-index: 10;
                    padding: clamp(1.5rem, 5vw, 4rem);
                    pointer-events: none;
                    display: flex; flex-direction: column; justify-content: space-between;
                }

                .top-nav { display: flex; justify-content: space-between; align-items: flex-start; pointer-events: auto; }

                .brand-label { font-size: 0.5rem; letter-spacing: 4px; opacity: 0.5; display: block; margin-bottom: 5px; }
                .header-hud h1 {
                    font-family: 'Orbitron', sans-serif; font-weight: 900;
                    font-size: clamp(0.9rem, 2.5vw, 1.6rem);
                    letter-spacing: 6px; margin: 0; color: var(--heading);
                }
                .header-line { width: 40px; height: 4px; background: var(--active-color); margin-top: 10px; box-shadow: 0 0 15px var(--active-color); }

                .view-toggle-hud { text-align: right; }
                .toggle-label { font-size: 0.5rem; letter-spacing: 2px; opacity: 0.4; display: block; margin-bottom: 8px; }
                .toggle-buttons { display: flex; gap: 4px; background: var(--surface); padding: 4px; border: 1px solid var(--border); }
                .toggle-btn {
                    background: transparent; border: none; padding: 6px 12px;
                    font: inherit; font-size: 0.55rem; font-weight: 900; letter-spacing: 1px;
                    color: var(--heading); opacity: 0.35; cursor: pointer; transition: 0.3s;
                }
                .toggle-btn.active { background: var(--active-color); color: var(--overlay); opacity: 1; box-shadow: 0 0 10px var(--active-color); }

                .cyber-card {
                    position: absolute; left: 50%; bottom: clamp(6rem, 15vh, 10rem); transform: translateX(-50%);
                    width: clamp(280px, 85vw, 380px);
                    background: var(--surface); backdrop-filter: blur(20px);
                    border: 1px solid var(--border);
                    pointer-events: auto;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.25);
                }
                .card-top-accent { height: 2px; background: var(--active-color); width: 100%; }
                .card-content { padding: 1.5rem; }
                .card-meta { display: flex; justify-content: space-between; font-size: 0.6rem; margin-bottom: 1rem; opacity: 0.6; }
                .id-code { border: 1px solid var(--active-color); padding: 2px 6px; color: var(--active-color); }
                .card-title { font-family: 'Orbitron', sans-serif; font-size: 1.3rem; color: var(--heading); margin: 0 0 0.5rem 0; }
                .card-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.5; margin-bottom: 1.5rem; }

                .feature-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .feature-item { font-size: 0.6rem; display: flex; align-items: center; gap: 8px; color: var(--heading); opacity: 0.8; }
                .feature-dot { width: 3px; height: 3px; background: var(--active-color); border-radius: 50%; }
                .card-action { padding: 0.8rem; text-align: center; background: var(--border); font-size: 0.55rem; letter-spacing: 2px; font-weight: 900; color: var(--active-color); }

                .footer-hud { display: flex; justify-content: space-between; align-items: flex-end; }
                .sys-log { font-size: 0.5rem; color: var(--muted); line-height: 1.8; }
                .status-blink { color: var(--active-color); }
                .dot { display: inline-block; width: 4px; height: 4px; background: currentColor; border-radius: 50%; animation: blink 1s infinite; margin-right: 5px; }
                .time-box { font-family: 'Orbitron', sans-serif; font-size: 0.65rem; color: var(--heading); opacity: 0.7; }

                .transition-overlay { position: fixed; inset: 0; z-index: 1000; background: var(--overlay); display: flex; align-items: center; justify-content: center; }
                .loading-wrap { width: 250px; text-align: center; }
                .glitch-text { font-family: 'Orbitron', sans-serif; font-size: 0.8rem; letter-spacing: 6px; color: var(--active-color); }
                .load-bar { width: 100%; height: 2px; background: var(--border); margin-top: 20px; }
                .load-fill { height: 100%; width: 0; background: var(--active-color); animation: load-anim 2.5s forwards; }

                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes load-anim { to { width: 100%; } }

                @media (max-width: 767px) {
                    .top-nav { flex-direction: column; gap: 1rem; }
                    .view-toggle-hud { text-align: left; }
                }
            `}</style>
        </div>
    );
}
