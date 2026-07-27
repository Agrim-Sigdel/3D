import React, { useEffect, useRef, useState, useCallback } from 'react';
import BackButton from './BackButton';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CONFIGURATION & THEME
 */
const AVAILABLE_MODES = {
    fun: true,
    work: true,
    normal: true
};

const PALETTE = {
    cyan: 0x0099cc,
    gold: 0xd4a017,
    purple: 0x8a2be2,
    light: 0xf4f7f6,
    grid: 0xcccccc,
    white: 0xffffff,
    text: 0x2d3748
};

const MODULES = [
    {
        id: 'fun',
        name: 'CREATIVE',
        code: 'CX-9',
        title: 'Fun Mode',
        description: 'Interactive animations, playful physics, and experimental design.',
        features: ['Smooth Animations', 'Interactive Elements', 'Modern UI'],
        x: -5.5,
        color: PALETTE.cyan,
        colorStr: '#0099cc'
    },
    {
        id: 'work',
        name: 'TERMINAL',
        code: 'TX-1',
        title: 'Work Mode',
        description: 'Professional command-line interface with developer tools.',
        features: ['Terminal Commands', 'Efficient Navigation', 'Project Logs'],
        x: 0,
        color: PALETTE.gold,
        colorStr: '#d4a017'
    },
    {
        id: 'normal',
        name: 'CLASSIC',
        code: 'CL-4',
        title: 'Normal Mode',
        description: 'A clean, high-performance, and straightforward layout.',
        features: ['Simple Design', 'Fast Loading', 'Intuitive UI'],
        x: 5.5,
        color: PALETTE.purple,
        colorStr: '#8a2be2'
    }
];

export default function App() {
    const mountRef = useRef(null);
    const [hoveredModule, setHoveredModule] = useState(MODULES[1]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [activeIndex, setActiveIndex] = useState(1);
    const [isSwitching, setIsSwitching] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    const stateRef = useRef({
        activeIndex: 1,
        isSwitching: false,
        mouse: new THREE.Vector2(),
        raycaster: new THREE.Raycaster(),
        podiums: [],
        camera: null
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleModuleSelect = useCallback((modeId) => {
        if (stateRef.current.isSwitching || !AVAILABLE_MODES[modeId]) return;

        const moduleData = MODULES.find(m => m.id === modeId);
        setSelectedModule(moduleData);
        setIsSwitching(true);
        stateRef.current.isSwitching = true;

        setTimeout(() => {
            setIsSwitching(false);
            stateRef.current.isSwitching = false;
            setSelectedModule(null);
        }, 2500);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(PALETTE.light);
        scene.fog = new THREE.FogExp2(PALETTE.light, 0.04);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const isMobile = width < 768;
        camera.position.set(0, isMobile ? 8 : 5, isMobile ? 25 : 18);
        stateRef.current.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x444444, 1.8);
        scene.add(ambient);

        const mainLight = new THREE.SpotLight(0xffffff, 4.0);
        mainLight.position.set(0, 20, 10);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.5;
        scene.add(mainLight);

        const grid = new THREE.GridHelper(60, 60, PALETTE.grid, PALETTE.grid);
        grid.position.y = -3;
        grid.material.transparent = true;
        grid.material.opacity = 0.3;
        scene.add(grid);

        const partGeo = new THREE.BufferGeometry();
        const partPos = new Float32Array(1500 * 3);
        for (let i = 0; i < 4500; i++) partPos[i] = (Math.random() - 0.5) * 50;
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.04, color: PALETTE.text, transparent: true, opacity: 0.25 }));
        scene.add(particles);

        // --- Custom Holographic STATIC Material Shader ---
        const createHologramMaterial = (color) => {
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(color) },
                    opacity: { value: 0.1 },
                    hover: { value: 0.0 }
                },
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.NormalBlending,
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
                        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                    }

                    void main() {
                        // Base Digital Grid
                        float grid = (sin(vUv.x * 50.0) * 0.5 + 0.5) * (sin(vUv.y * 50.0) * 0.5 + 0.5);
                        
                        // Static Noise Pattern
                        float n = random(vec2(vUv.y * 100.0, time * 0.5));
                        float staticNoise = random(vUv + time * 0.01);
                        
                        // Scanning Static Beam
                        float beamY = mod(time * 0.3, 1.0);
                        float beamDist = abs(vUv.y - beamY);
                        float beamStatic = step(beamDist, 0.05) * random(vec2(vUv.x * 20.0, time));
                        
                        // High Frequency Flickering
                        float flicker = random(vec2(time, 0.0)) > 0.95 ? 1.5 : 1.0;
                        
                        // Edge transparency
                        float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0) * pow(1.0 - abs(vUv.y - 0.5) * 2.0, 3.0);
                        
                        float alpha = opacity;
                        
                        // On hover, introduce the static chaos
                        alpha += hover * (
                            grid * 0.05 + 
                            beamStatic * 0.5 + 
                            (staticNoise * 0.1 * flicker)
                        );
                        
                        vec3 finalColor = color;
                        // Tint static white slightly on hover
                        finalColor += hover * beamStatic * 0.3;
                        
                        gl_FragColor = vec4(finalColor, alpha * (edge + 0.1) * flicker);
                    }
                `
            });
        };

        const podiumGroups = MODULES.map((mod, i) => {
            const group = new THREE.Group();
            group.position.x = mod.x;
            group.position.y = -3;

            const baseGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.5, 8);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x2a303c, roughness: 0.5, metalness: 0.6 });
            const base = new THREE.Mesh(baseGeo, baseMat);
            group.add(base);

            const bodyGeo = new THREE.CylinderGeometry(1.2, 1.6, 3, 8);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x1e242f,
                roughness: 0.2,
                metalness: 0.8,
                emissive: mod.color,
                emissiveIntensity: 0.15
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1.75;
            group.add(body);

            const ringGeo = new THREE.TorusGeometry(1.45, 0.05, 8, 50);
            const ringMat = new THREE.MeshBasicMaterial({ color: mod.color, transparent: true, opacity: 0.6 });

            const ring1 = new THREE.Mesh(ringGeo, ringMat);
            ring1.rotation.x = Math.PI / 2;
            ring1.position.y = 0.8;
            group.add(ring1);

            const ring2 = ring1.clone();
            ring2.position.y = 2.6;
            ring2.scale.set(0.85, 0.85, 0.85);
            group.add(ring2);

            for (let j = 0; j < 8; j++) {
                const stripGeo = new THREE.BoxGeometry(0.06, 2.8, 0.12);
                const stripMat = new THREE.MeshBasicMaterial({ color: mod.color });
                const strip = new THREE.Mesh(stripGeo, stripMat);
                const angle = (j / 8) * Math.PI * 2;
                strip.position.set(Math.cos(angle) * 1.35, 1.75, Math.sin(angle) * 1.35);
                strip.lookAt(0, 1.75, 0);
                group.add(strip);
            }

            const cardMat = createHologramMaterial(mod.color);
            const card = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.8), cardMat);
            card.position.y = 6.2;
            group.add(card);

            const scannerGeo = new THREE.TorusGeometry(1.15, 0.025, 16, 100);
            const scanner = new THREE.Mesh(scannerGeo, new THREE.MeshBasicMaterial({ color: mod.color, transparent: true, opacity: 0.8 }));
            scanner.position.y = 3.6;
            scanner.rotation.x = Math.PI / 2;
            group.add(scanner);

            group.userData = {
                id: mod.id,
                index: i,
                card,
                scanner,
                rings: [ring1, ring2],
                body,
                baseColor: mod.color
            };
            scene.add(group);
            return group;
        });
        stateRef.current.podiums = podiumGroups;

        const onMouseMove = (e) => {
            stateRef.current.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            stateRef.current.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const onClick = () => {
            stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
            const targetObjects = podiumGroups.map(p => p.children[12]);
            const intersects = stateRef.current.raycaster.intersectObjects(targetObjects);
            if (intersects.length > 0) {
                handleModuleSelect(intersects[0].object.parent.userData.id);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            particles.rotation.y += 0.0004;

            stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
            const targetObjects = podiumGroups.map(p => p.children[12]);
            const intersects = stateRef.current.raycaster.intersectObjects(targetObjects);

            if (intersects.length > 0) {
                const hoveredIdx = intersects[0].object.parent.userData.index;
                if (stateRef.current.activeIndex !== hoveredIdx) {
                    stateRef.current.activeIndex = hoveredIdx;
                    setActiveIndex(hoveredIdx);
                    setHoveredModule(MODULES[hoveredIdx]);
                }
            }

            podiumGroups.forEach((p, i) => {
                const isActive = i === stateRef.current.activeIndex;
                const data = p.userData;
                const pulse = (Math.sin(time * 4) * 0.5 + 0.5);
                const activePulse = isActive ? (0.8 + pulse * 0.2) : 0.2;

                data.rings.forEach((ring, ri) => {
                    ring.rotation.z += 0.015 * (ri + 1);
                    ring.material.opacity = THREE.MathUtils.lerp(ring.material.opacity, isActive ? 0.9 : 0.4, 0.1);
                });

                data.scanner.rotation.z -= 0.025;
                data.scanner.rotation.x = (Math.PI / 2) + Math.sin(time * 1.5) * 0.08;

                // Update Static Hologram Uniforms
                data.card.material.uniforms.time.value = time;
                data.card.material.uniforms.hover.value = THREE.MathUtils.lerp(
                    data.card.material.uniforms.hover.value,
                    isActive ? 1.0 : 0.0,
                    0.1
                );
                data.card.material.uniforms.opacity.value = THREE.MathUtils.lerp(
                    data.card.material.uniforms.opacity.value,
                    isActive ? 0.4 : 0.08,
                    0.08
                );

                data.card.position.y = 6.2 + Math.sin(time * 2 + i) * 0.15;

                data.body.material.emissiveIntensity = THREE.MathUtils.lerp(
                    data.body.material.emissiveIntensity,
                    isActive ? 0.3 * activePulse : 0.02,
                    0.1
                );

                const targetScale = isActive ? 1.12 : 1.0;
                p.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
            });

            const targetCamX = stateRef.current.mouse.x * (window.innerWidth < 768 ? 1.5 : 3.5);
            const targetCamY = (window.innerWidth < 768 ? 8 : 5) + stateRef.current.mouse.y * 1.5;

            camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.04);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.04);
            camera.lookAt(0, window.innerWidth < 768 ? 4 : 2.5, 0);

            renderer.render(scene, camera);
        };

        animate();

        const onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const mobile = w < 768;
            camera.aspect = w / h;
            camera.position.z = mobile ? 25 : 18;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            podiumGroups.forEach((p, i) => {
                p.position.x = mobile ? (MODULES[i].x * 0.6) : MODULES[i].x;
            });
        };
        window.addEventListener('resize', onResize);
        onResize();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(frameId);
            renderer.dispose();
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        };
    }, [handleModuleSelect]);

    return (
        <div className="mode-selector-hud" style={{ '--active-color': hoveredModule?.colorStr || '#00f2ff' }}>
            <BackButton />
            <div className="vignette" />
            <div className="scanline" />

            <div className="corner-brackets top-left" />
            <div className="corner-brackets top-right" />
            <div className="corner-brackets bottom-left" />
            <div className="corner-brackets bottom-right" />

            <div ref={mountRef} className="canvas-container" />

            <div className="ui-layer">
                <motion.div
                    className="header-hud"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="header-glitch-wrap">
                        <h1>AGRIM SIGDEL</h1>
                        <div className="header-line" />
                    </div>
                </motion.div>



                <AnimatePresence mode="wait">
                    {hoveredModule && !isSwitching && (
                        <motion.div
                            key={hoveredModule.id}
                            className="cyber-card"
                            initial={{ opacity: 0, rotateX: 20, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        >
                            <div className="card-body">
                                <h2 className="card-title">{hoveredModule.title}</h2>
                                <p className="card-desc">{hoveredModule.description}</p>

                                <div className="feature-grid">
                                    {hoveredModule.features.map((f, i) => (
                                        <div key={f} className="feature-node" style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div className="node-dot" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="footer-hud"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="coord-panel">
                        <div className="coord-item">LAT: 27.6710° N</div>
                        <div className="coord-item">LNG: 85.3414° E</div>
                    </div>

                    <div className="social-links-hud">
                        <a href="#github" className="hud-link">GITHUB</a>
                        <div className="link-divider" />
                        <a href="#linkedin" className="hud-link">LINKEDIN</a>
                    </div>

                    <div className="time-display">{currentTime}</div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isSwitching && (
                    <motion.div
                        className="transition-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="hex-bg" />
                        <div className="loading-core">
                            <div className="spinner-outer" />
                            <div className="spinner-inner" />
                            <h3 className="loading-text">RECONFIGURING</h3>
                            <div className="progress-container">
                                <div className="progress-glow" />
                                <div className="progress-bar-fill" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@300;400;700&display=swap');

                :root {
                    --bg-light: #f4f7f6;
                    --text-main: #2d3748;
                    --text-muted: #718096;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --glass-bg: rgba(255, 255, 255, 0.85);
                }

                .mode-selector-hud {
                    position: fixed; inset: 0; background: var(--bg-light);
                    font-family: 'JetBrains Mono', monospace; 
                    color: var(--text-main);
                    overflow: hidden; cursor: crosshair;
                    perspective: 1000px;
                    touch-action: none;
                }

                .vignette { position: absolute; inset: 0; background: radial-gradient(circle, transparent 30%, rgba(255,255,255,0.6) 100%); pointer-events: none; z-index: 2; }
                .scanline { display: none; }

                .canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }

                .corner-brackets { position: absolute; width: clamp(20px, 5vw, 40px); height: clamp(20px, 5vw, 40px); border: 2px solid var(--active-color); opacity: 0.5; z-index: 5; pointer-events: none; transition: 0.5s; }
                .top-left { top: 2rem; left: 2rem; border-right: 0; border-bottom: 0; }
                .top-right { top: 2rem; right: 2rem; border-left: 0; border-bottom: 0; }
                .bottom-left { bottom: 2rem; left: 2rem; border-right: 0; border-top: 0; }
                .bottom-right { bottom: 2rem; right: 2rem; border-left: 0; border-top: 0; }

                .ui-layer { 
                    position: absolute; inset: 0; z-index: 10; 
                    padding: clamp(2rem, 4vw, 4rem); 
                    pointer-events: none; 
                    display: flex; flex-direction: column; 
                    justify-content: space-between;
                }

                .header-hud { pointer-events: auto; display: flex; flex-direction: column; align-items: flex-start; }
                .header-hud h1 { 
                    font-family: 'Orbitron', sans-serif; font-weight: 900; 
                    font-size: clamp(1.5rem, 3vw, 2.5rem); 
                    letter-spacing: clamp(1px, 0.5vw, 4px); 
                    margin: 0; color: var(--text-main); transition: 0.3s; text-shadow: none;
                }
                .header-line { width: 80px; height: 4px; background: var(--active-color); margin-top: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .status-indicator { display: flex; align-items: center; margin-top: 12px; gap: 10px; background: var(--glass-bg); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .blink-dot { width: 8px; height: 8px; background: var(--active-color); border-radius: 50%; animation: blink 1.5s infinite; }
                .status-text { font-size: 0.6rem; letter-spacing: 1px; color: var(--text-muted); margin: 0; font-weight: 700; }



                .cyber-card {
                    position: absolute; right: 4rem; top: 50%; transform: translateY(-50%);
                    width: clamp(280px, 25vw, 360px);
                    background: var(--glass-bg); backdrop-filter: blur(20px);
                    border: 1px solid var(--border-color); border-top: 4px solid var(--active-color);
                    padding: 0; pointer-events: auto; border-radius: 16px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                    overflow: hidden;
                    clip-path: none;
                }

                .card-glitch-border { display: none; }
                
                .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 1.5rem; background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--border-color); }
                .card-id-tag { background: var(--active-color); color: #fff; font-weight: 900; font-size: 0.65rem; padding: 4px 10px; border-radius: 6px; }
                .card-category { font-family: 'Orbitron'; font-size: 0.6rem; letter-spacing: 2px; color: var(--text-muted); font-weight: 700; }

                .card-body { padding: 1.5rem; }
                .card-title { font-family: 'Orbitron'; font-size: clamp(1.2rem, 4vw, 1.8rem); margin: 0 0 0.8rem; color: var(--text-main); font-weight: 900; }
                .card-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem; }

                .feature-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
                .feature-node { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: var(--text-main); font-weight: 700; background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px; }
                .node-dot { width: 6px; height: 6px; background: var(--active-color); border-radius: 50%; }

                .card-footer { padding: 1.2rem 1.5rem; background: rgba(0,0,0,0.02); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
                .initialize-prompt { font-size: 0.75rem; font-weight: 900; color: var(--active-color); letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
                .prompt-arrows { font-size: 1rem; }
                .card-serial { font-size: 0.55rem; color: var(--text-muted); font-weight: 700; }

                .footer-hud { display: flex; justify-content: space-between; align-items: center; pointer-events: auto; width: 100%; background: var(--glass-bg); padding: 12px 24px; border-radius: 30px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .coord-panel { font-size: 0.65rem; color: var(--text-muted); font-weight: 700; display: flex; gap: 16px; border-left: none; padding-left: 0; }
                
                .social-links-hud { display: flex; align-items: center; gap: 1.5rem; }
                .hud-link { font-size: 0.65rem; color: var(--text-muted); text-decoration: none; font-weight: 700; transition: 0.3s; letter-spacing: 1px; opacity: 1; }
                .hud-link:hover { color: var(--active-color); }
                .link-divider { width: 4px; height: 4px; background: var(--text-muted); border-radius: 50%; opacity: 0.3; }
                
                .time-display { font-family: 'Orbitron'; font-size: 0.8rem; font-weight: 700; color: var(--text-main); opacity: 1; }

                .transition-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(244, 247, 246, 0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
                .hex-bg { position: absolute; inset: 0; opacity: 0.1; background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E"); }
                
                .loading-core { text-align: center; width: 240px; background: var(--glass-bg); padding: 2rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid var(--border-color); }
                .spinner-outer { width: 50px; height: 50px; border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--active-color); border-radius: 50%; animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; margin: 0 auto; }
                .loading-text { font-family: 'Orbitron'; margin-top: 1.5rem; font-size: 0.75rem; color: var(--text-main); font-weight: 900; letter-spacing: 3px; }
                .progress-container { width: 100%; height: 4px; background: rgba(0,0,0,0.05); margin-top: 1.5rem; border-radius: 2px; position: relative; overflow: hidden; }
                .progress-bar-fill { position: absolute; left: 0; height: 100%; width: 0; background: var(--active-color); animation: load-progress 2.5s ease-in-out forwards; }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes load-progress { to { width: 100%; } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }



                @media (max-width: 767px) {
                    .ui-layer { padding: 1.5rem; }
                    .header-hud { align-items: center; text-align: center; }
                    .header-line { margin-inline: auto; }
                    .cyber-card { position: absolute; right: auto; left: 50%; transform: translateX(-50%); top: auto; bottom: 8.5rem; width: 90vw; max-height: 45vh; overflow-y: auto; }
                    .footer-hud { flex-direction: column; align-items: center; gap: 1rem; border-radius: 20px; padding: 16px; margin-bottom: 0.5rem; }
                    .coord-panel { justify-content: center; width: 100%; border-top: none; }
                }
            `}</style>
        </div>
    );
}
