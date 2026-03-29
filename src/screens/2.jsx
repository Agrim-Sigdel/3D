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
    cyan: 0x00f2ff,
    gold: 0xffcc00,
    purple: 0xaa00ff,
    dark: 0x000b14,
    grid: 0x002233,
    white: 0xffffff
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
        colorStr: '#00f2ff'
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
        colorStr: '#ffcc00'
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
        colorStr: '#aa00ff'
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
        scene.fog = new THREE.FogExp2(PALETTE.dark, 0.04);
        
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const isMobile = width < 768;
        camera.position.set(0, isMobile ? 8 : 5, isMobile ? 25 : 18);
        stateRef.current.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x404040, 1.2);
        scene.add(ambient);
        
        const mainLight = new THREE.SpotLight(0xffffff, 2.5);
        mainLight.position.set(0, 20, 10);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.5;
        scene.add(mainLight);

        const grid = new THREE.GridHelper(60, 60, PALETTE.cyan, PALETTE.grid);
        grid.position.y = -3;
        grid.material.transparent = true;
        grid.material.opacity = 0.15;
        scene.add(grid);

        const partGeo = new THREE.BufferGeometry();
        const partPos = new Float32Array(1500 * 3);
        for(let i=0; i<4500; i++) partPos[i] = (Math.random() - 0.5) * 50;
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.03, color: 0x00f2ff, transparent: true, opacity: 0.3 }));
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
                blending: THREE.AdditiveBlending,
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
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.8 });
            const base = new THREE.Mesh(baseGeo, baseMat);
            group.add(base);

            const bodyGeo = new THREE.CylinderGeometry(1.2, 1.6, 3, 8);
            const bodyMat = new THREE.MeshStandardMaterial({ 
                color: 0x0a0a0a, 
                roughness: 0.1, 
                metalness: 1.0,
                emissive: mod.color,
                emissiveIntensity: 0.02
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1.75;
            group.add(body);

            const ringGeo = new THREE.TorusGeometry(1.45, 0.05, 8, 50);
            const ringMat = new THREE.MeshBasicMaterial({ color: mod.color, transparent: true, opacity: 0.6 });
            
            const ring1 = new THREE.Mesh(ringGeo, ringMat);
            ring1.rotation.x = Math.PI/2;
            ring1.position.y = 0.8;
            group.add(ring1);

            const ring2 = ring1.clone();
            ring2.position.y = 2.6;
            ring2.scale.set(0.85, 0.85, 0.85);
            group.add(ring2);

            for(let j=0; j<8; j++) {
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
                    <div className="status-indicator">
                        <span className="blink-dot" />
                        <p className="status-text">SYSTEM_ACTIVE // BROADCASTING_EXPERIENCE_SIGNAL</p>
                    </div>
                </motion.div>

                <div className="side-monitor">
                    <div className="monitor-row">
                        <span>CPU_LOAD</span>
                        <div className="mini-bar"><div className="fill" style={{ width: '65%' }} /></div>
                    </div>
                    <div className="monitor-row">
                        <span>NET_PULSE</span>
                        <div className="mini-bar"><div className="fill" style={{ width: '82%' }} /></div>
                    </div>
                    <div className="monitor-row">
                        <span>MEM_ALLOC</span>
                        <div className="mini-bar"><div className="fill" style={{ width: '34%' }} /></div>
                    </div>
                    <div className="monitor-footer">ENCRYPT_LEVEL: OMEGA_8</div>
                </div>

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
                            <div className="card-glitch-border" />
                            <div className="card-header">
                                <div className="card-id-tag">{hoveredModule.code}</div>
                                <div className="card-category">{hoveredModule.name}</div>
                            </div>
                            
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

                            <div className="card-footer">
                                <div className="initialize-prompt">
                                    <span className="prompt-arrows">&gt;&gt;</span>
                                    INIT_DRIVE
                                    <span className="prompt-bracket">]</span>
                                </div>
                                <div className="card-serial">SN_{hoveredModule.id.toUpperCase()}</div>
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
                    --bg-dark: #000b14;
                }

                .mode-selector-hud {
                    position: fixed; inset: 0; background: var(--bg-dark);
                    font-family: 'JetBrains Mono', monospace; 
                    color: var(--active-color);
                    overflow: hidden; cursor: crosshair;
                    perspective: 1000px;
                    touch-action: none;
                }

                .vignette { position: absolute; inset: 0; background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%); pointer-events: none; z-index: 2; }
                .scanline { position: absolute; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); z-index: 100; background-size: 100% 4px, 3px 100%; pointer-events: none; opacity: 0.3; }

                .canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }

                .corner-brackets { position: absolute; width: clamp(20px, 5vw, 40px); height: clamp(20px, 5vw, 40px); border: 2px solid var(--active-color); opacity: 0.3; z-index: 5; pointer-events: none; transition: 0.5s; }
                .top-left { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
                .top-right { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
                .bottom-left { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
                .bottom-right { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

                .ui-layer { 
                    position: absolute; inset: 0; z-index: 10; 
                    padding: clamp(1rem, 3vw, 3rem); 
                    pointer-events: none; 
                    display: flex; flex-direction: column; 
                    justify-content: space-between;
                }

                .header-hud { pointer-events: auto; }
                .header-hud h1 { 
                    font-family: 'Orbitron', sans-serif; font-weight: 900; 
                    font-size: clamp(1.2rem, 3vw, 2rem); 
                    letter-spacing: clamp(2px, 1vw, 8px); 
                    margin: 0; text-shadow: 0 0 15px var(--active-color); transition: 0.3s; 
                }
                .header-line { width: 60px; height: 3px; background: var(--active-color); margin-top: 5px; box-shadow: 0 0 10px var(--active-color); }
                .status-indicator { display: flex; align-items: center; margin-top: 10px; gap: 8px; }
                .blink-dot { width: 6px; height: 6px; background: var(--active-color); border-radius: 50%; animation: blink 1s infinite; }
                .status-text { font-size: 0.5rem; letter-spacing: 1px; opacity: 0.6; margin: 0; }

                .side-monitor { 
                    position: absolute; right: 3rem; top: 50%; transform: translateY(-50%);
                    width: 140px; font-size: 0.5rem; opacity: 0.5; 
                    display: flex; flex-direction: column;
                }
                .monitor-row { margin-bottom: 8px; }
                .mini-bar { width: 100%; height: 2px; background: rgba(255,255,255,0.05); margin-top: 3px; }
                .fill { height: 100%; background: var(--active-color); }

                .cyber-card {
                    position: absolute; left: 50%; bottom: clamp(5rem, 12vh, 8rem); transform: translateX(-50%);
                    width: clamp(260px, 85vw, 360px);
                    background: rgba(0, 11, 20, 0.8); backdrop-filter: blur(15px);
                    border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid var(--active-color);
                    padding: 0; pointer-events: auto; clip-path: polygon(0 0, 94% 0, 100% 8%, 100% 100%, 6% 100%, 0 92%);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.6);
                }

                .card-glitch-border { position: absolute; top: 0; right: 0; width: 30px; height: 30px; background: linear-gradient(45deg, transparent 50%, var(--active-color) 40%); opacity: 0.3; }
                
                .card-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .card-id-tag { background: var(--active-color); color: #000; font-weight: 900; font-size: 0.55rem; padding: 1px 6px; }
                .card-category { font-family: 'Orbitron'; font-size: 0.5rem; letter-spacing: 1.5px; opacity: 0.6; }

                .card-body { padding: 1rem 1.2rem; }
                .card-title { font-family: 'Orbitron'; font-size: clamp(1rem, 4vw, 1.4rem); margin: 0 0 0.5rem; color: #fff; }
                .card-desc { font-size: 0.75rem; opacity: 0.5; line-height: 1.4; margin-bottom: 1rem; }

                .feature-grid { display: grid; grid-template-columns: 1fr; gap: 6px; }
                .feature-node { display: flex; align-items: center; gap: 6px; font-size: 0.6rem; opacity: 0.8; }
                .node-dot { width: 3px; height: 3px; background: var(--active-color); }

                .card-footer { padding: 0.8rem 1.2rem; background: rgba(255,255,255,0.01); display: flex; justify-content: space-between; align-items: center; }
                .initialize-prompt { font-size: 0.6rem; font-weight: 900; color: var(--active-color); letter-spacing: 1.5px; }
                .card-serial { font-size: 0.45rem; opacity: 0.2; }

                .footer-hud { display: flex; justify-content: space-between; align-items: flex-end; pointer-events: auto; width: 100%; }
                .coord-panel { font-size: 0.5rem; opacity: 0.4; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 0.8rem; }
                
                .social-links-hud { display: flex; align-items: center; gap: 1rem; }
                .hud-link { font-size: 0.5rem; color: #fff; text-decoration: none; opacity: 0.4; transition: 0.3s; }
                .hud-link:hover { opacity: 1; color: var(--active-color); }
                .link-divider { width: 1px; height: 8px; background: rgba(255,255,255,0.1); }
                
                .time-display { font-family: 'Orbitron'; font-size: 0.65rem; opacity: 0.7; }

                .transition-overlay { position: fixed; inset: 0; z-index: 1000; background: var(--bg-dark); display: flex; align-items: center; justify-content: center; }
                .hex-bg { position: absolute; inset: 0; opacity: 0.05; background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E"); }
                
                .loading-core { text-align: center; width: 200px; }
                .spinner-outer { width: 60px; height: 60px; border: 2px solid rgba(var(--active-color), 0.1); border-top-color: var(--active-color); border-radius: 50%; animation: spin 2s linear infinite; margin: 0 auto; }
                .loading-text { font-family: 'Orbitron'; margin-top: 1rem; font-size: 0.6rem; color: #fff; letter-spacing: 4px; }
                .progress-container { width: 100%; height: 1px; background: rgba(255,255,255,0.05); margin-top: 1rem; position: relative; }
                .progress-bar-fill { position: absolute; left: 0; height: 100%; width: 0; background: var(--active-color); animation: load-progress 2.5s ease-in-out forwards; }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes load-progress { to { width: 100%; } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

                @media (max-width: 1024px) {
                    .side-monitor { display: none; }
                }

                @media (max-width: 767px) {
                    .header-hud { width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; }
                    .header-line { margin-inline: auto; }
                    .cyber-card { width: 280px; bottom: 6rem; }
                    .footer-hud { flex-direction: column; align-items: center; gap: 0.8rem; }
                    .coord-panel { border-left: 0; border-top: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 0 0 0; text-align: center; width: 100%; }
                }
            `}</style>
        </div>
    );
}
