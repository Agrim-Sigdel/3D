import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
        x: -6,
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
        x: 6,
        color: PALETTE.purple,
        colorStr: '#aa00ff'
    }
];

export default function App() {
    const mountRef = useRef(null);
    const [viewMode, setViewMode] = useState('diamond'); // 'pillar' or 'diamond'
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
        camera: null,
        viewMode: 'diamond'
    });

    // Keep ref in sync for the animation loop
    useEffect(() => {
        stateRef.current.viewMode = viewMode;
    }, [viewMode]);

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
        camera.position.set(0, isMobile ? 8 : 6, isMobile ? 25 : 20);
        stateRef.current.camera = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x404040, 1.5);
        scene.add(ambient);
        
        const mainLight = new THREE.SpotLight(0xffffff, 3);
        mainLight.position.set(0, 25, 15);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.5;
        scene.add(mainLight);

        const grid = new THREE.GridHelper(60, 60, PALETTE.cyan, PALETTE.grid);
        grid.position.y = -4;
        grid.material.transparent = true;
        grid.material.opacity = 0.1;
        scene.add(grid);

        const partGeo = new THREE.BufferGeometry();
        const partPos = new Float32Array(1000 * 3);
        for(let i=0; i<3000; i++) partPos[i] = (Math.random() - 0.5) * 60;
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.2 }));
        scene.add(particles);

        // --- UNIFIED STATIC SHADER ---
        const createHologramMaterial = (color) => {
            return new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(color) },
                    opacity: { value: 0.15 },
                    hover: { value: 0.0 }
                },
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexShader: `
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    void main() {
                        vUv = uv;
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
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec3 vPosition;

                    float random(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                    }

                    void main() {
                        vec3 viewDir = normalize(cameraPosition - vPosition);
                        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);
                        
                        float n = random(vec2(vPosition.y * 50.0, time * 2.0));
                        float grid = step(0.97, fract(vPosition.x * 5.0)) + step(0.97, fract(vPosition.y * 5.0));
                        float scan = step(abs(vPosition.y - sin(time * 0.8) * 2.0), 0.1) * random(vec2(vPosition.x, time));
                        
                        float flicker = 0.9 + 0.2 * random(vec2(time, 1.0));
                        float alpha = opacity + hover * (fresnel * 0.4 + scan * 0.5 + grid * 0.1);
                        
                        gl_FragColor = vec4(color + (hover * scan * 0.4), alpha * flicker);
                    }
                `
            });
        };

        const podiumGroups = MODULES.map((mod, i) => {
            const group = new THREE.Group();
            group.position.x = mod.x;
            group.position.y = -4;

            // Diamond View Assets
            const diamondBase = new THREE.Mesh(
                new THREE.CylinderGeometry(1.6, 2.0, 0.4, 32),
                new THREE.MeshStandardMaterial({ color: 0x020202, roughness: 0.1, metalness: 0.9 })
            );
            const diamondStem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 1.5, 2.5, 32),
                diamondBase.material
            );
            diamondStem.position.y = 1.4;
            const diamondRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.85, 0.06, 16, 64),
                new THREE.MeshBasicMaterial({ color: mod.color, transparent: true, opacity: 0.8 })
            );
            diamondRing.rotation.x = Math.PI / 2;
            diamondRing.position.y = 2.65;
            const diamondObj = new THREE.Mesh(
                new THREE.OctahedronGeometry(1.8, 0),
                createHologramMaterial(mod.color)
            );
            diamondObj.scale.set(1.1, 1.6, 1.1);
            diamondObj.position.y = 5.2;

            // Pillar View Assets
            const pillarBase = new THREE.Mesh(
                new THREE.CylinderGeometry(1.8, 2.2, 0.5, 8),
                new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2, metalness: 0.8 })
            );
            const pillarBody = new THREE.Mesh(
                new THREE.CylinderGeometry(1.2, 1.6, 3, 8),
                new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.1, metalness: 1.0, emissive: mod.color, emissiveIntensity: 0.02 })
            );
            pillarBody.position.y = 1.75;
            const pillarCard = new THREE.Mesh(
                new THREE.PlaneGeometry(3.2, 4.8),
                createHologramMaterial(mod.color)
            );
            pillarCard.position.y = 6.2;
            
            // Sub-Groups for easy toggling
            const diamondGroup = new THREE.Group();
            diamondGroup.add(diamondBase, diamondStem, diamondRing, diamondObj);
            
            const pillarGroup = new THREE.Group();
            pillarGroup.add(pillarBase, pillarBody, pillarCard);

            group.add(diamondGroup);
            group.add(pillarGroup);

            const pLight = new THREE.PointLight(mod.color, 0.2, 10);
            pLight.position.set(0, 5, 0);
            group.add(pLight);

            group.userData = { 
                id: mod.id, 
                index: i, 
                diamondGroup,
                pillarGroup,
                diamondObj,
                pillarCard,
                pLight,
                diamondRing,
                pillarBody
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
            const targets = stateRef.current.viewMode === 'diamond' 
                ? podiumGroups.map(p => p.userData.diamondObj)
                : podiumGroups.map(p => p.userData.pillarCard);
            
            const intersects = stateRef.current.raycaster.intersectObjects(targets);
            if (intersects.length > 0) {
                handleModuleSelect(intersects[0].object.parent.parent.userData.id);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        let frameId;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            const mode = stateRef.current.viewMode;

            particles.rotation.y += 0.0002;

            stateRef.current.raycaster.setFromCamera(stateRef.current.mouse, camera);
            const targets = mode === 'diamond' 
                ? podiumGroups.map(p => p.userData.diamondObj)
                : podiumGroups.map(p => p.userData.pillarCard);
            
            const intersects = stateRef.current.raycaster.intersectObjects(targets);
            if (intersects.length > 0) {
                const idx = intersects[0].object.parent.parent.userData.index;
                if (stateRef.current.activeIndex !== idx) {
                    stateRef.current.activeIndex = idx;
                    setActiveIndex(idx);
                    setHoveredModule(MODULES[idx]);
                }
            }

            podiumGroups.forEach((p, i) => {
                const isActive = i === stateRef.current.activeIndex;
                const d = p.userData;

                // Toggle visibility
                d.diamondGroup.visible = mode === 'diamond';
                d.pillarGroup.visible = mode === 'pillar';

                // Shared Bobbing
                p.position.y = -4 + Math.sin(time * 1.2 + i) * 0.1;

                if (mode === 'diamond') {
                    d.diamondObj.rotation.y += isActive ? 0.02 : 0.005;
                    d.diamondObj.material.uniforms.time.value = time;
                    d.diamondObj.material.uniforms.hover.value = THREE.MathUtils.lerp(d.diamondObj.material.uniforms.hover.value, isActive ? 1.0 : 0.0, 0.1);
                    d.diamondRing.rotation.z += 0.01;
                } else {
                    d.pillarCard.material.uniforms.time.value = time;
                    d.pillarCard.material.uniforms.hover.value = THREE.MathUtils.lerp(d.pillarCard.material.uniforms.hover.value, isActive ? 1.0 : 0.0, 0.1);
                    d.pillarBody.material.emissiveIntensity = isActive ? 0.4 : 0.02;
                }

                d.pLight.intensity = THREE.MathUtils.lerp(d.pLight.intensity, isActive ? 2.0 : 0.2, 0.1);
                const targetScale = isActive ? 1.1 : 1.0;
                p.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
            });

            camera.position.x = THREE.MathUtils.lerp(camera.position.x, stateRef.current.mouse.x * 2, 0.05);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, (isMobile ? 8 : 6) + stateRef.current.mouse.y, 0.05);
            camera.lookAt(0, 2.5, 0);

            renderer.render(scene, camera);
        };

        animate();

        const onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            podiumGroups.forEach((p, i) => {
                p.position.x = w < 768 ? (MODULES[i].x * 0.7) : MODULES[i].x;
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
            
            <div ref={mountRef} className="canvas-container" />

            <div className="ui-layer">
                <div className="top-nav">
                    <motion.div 
                        className="header-hud"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="brand-group">
                            <span className="brand-label">OPERATING SYSTEM</span>
                            <h1>AGRIM SIGDEL v3.5</h1>
                            <div className="header-line" />
                        </div>
                    </motion.div>

                    {/* VIEW MODE TOGGLE */}
                    <motion.div 
                        className="view-toggle-hud"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span className="toggle-label">RENDER_ENGINE</span>
                        <div className="toggle-buttons">
                            <button 
                                className={`toggle-btn ${viewMode === 'pillar' ? 'active' : ''}`}
                                onClick={() => setViewMode('pillar')}
                            >
                                PILLAR
                            </button>
                            <button 
                                className={`toggle-btn ${viewMode === 'diamond' ? 'active' : ''}`}
                                onClick={() => setViewMode('diamond')}
                            >
                                DIAMOND
                            </button>
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
                        <div>NET_UP: 27.6710°N 85.3414°E</div>
                        <div className="status-blink"><span className="dot" /> MODE: {viewMode.toUpperCase()}</div>
                    </div>
                    <div className="time-box">{currentTime}</div>
                </div>
            </div>

            <AnimatePresence>
                {isSwitching && (
                    <motion.div className="transition-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="loading-wrap">
                            <div className="glitch-text">BOOTING_{selectedModule?.id.toUpperCase()}</div>
                            <div className="load-bar"><div className="load-fill" /></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@300;400;700&display=swap');

                .mode-selector-hud {
                    position: fixed; inset: 0; background: #000b14;
                    font-family: 'JetBrains Mono', monospace; 
                    color: var(--active-color);
                    overflow: hidden; touch-action: none;
                }

                .vignette { position: absolute; inset: 0; background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.9) 100%); pointer-events: none; z-index: 2; }
                .scanline { position: absolute; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%); z-index: 100; background-size: 100% 4px; pointer-events: none; opacity: 0.15; }
                .canvas-container { width: 100%; height: 100%; }

                .ui-layer { 
                    position: absolute; inset: 0; z-index: 10; 
                    padding: clamp(1.5rem, 5vw, 4rem); 
                    pointer-events: none; 
                    display: flex; flex-direction: column; 
                    justify-content: space-between;
                }

                .top-nav { display: flex; justify-content: space-between; align-items: flex-start; pointer-events: auto; }

                .header-hud { pointer-events: auto; }
                .brand-label { font-size: 0.5rem; letter-spacing: 4px; opacity: 0.5; display: block; margin-bottom: 5px; }
                .header-hud h1 { 
                    font-family: 'Orbitron', sans-serif; font-weight: 900; 
                    font-size: clamp(0.9rem, 2.5vw, 1.6rem); 
                    letter-spacing: 6px; margin: 0; color: #fff;
                }
                .header-line { width: 40px; height: 4px; background: var(--active-color); margin-top: 10px; box-shadow: 0 0 15px var(--active-color); }

                .view-toggle-hud { text-align: right; }
                .toggle-label { font-size: 0.5rem; letter-spacing: 2px; opacity: 0.4; display: block; margin-bottom: 8px; }
                .toggle-buttons { display: flex; gap: 4px; background: rgba(255,255,255,0.03); padding: 4px; border: 1px solid rgba(255,255,255,0.05); }
                .toggle-btn { 
                    background: transparent; border: none; padding: 6px 12px; 
                    font-size: 0.55rem; font-weight: 900; letter-spacing: 1px;
                    color: #fff; opacity: 0.3; cursor: pointer; transition: 0.3s;
                }
                .toggle-btn.active { background: var(--active-color); color: #000; opacity: 1; box-shadow: 0 0 10px var(--active-color); }

                .cyber-card {
                    position: absolute; left: 50%; bottom: clamp(6rem, 15vh, 10rem); transform: translateX(-50%);
                    width: clamp(280px, 85vw, 380px);
                    background: rgba(0, 5, 10, 0.9); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1);
                    pointer-events: auto;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                }
                .card-top-accent { height: 2px; background: var(--active-color); width: 100%; }
                .card-content { padding: 1.5rem; }
                .card-meta { display: flex; justify-content: space-between; font-size: 0.6rem; margin-bottom: 1rem; opacity: 0.6; }
                .id-code { border: 1px solid var(--active-color); padding: 2px 6px; color: var(--active-color); }
                .card-title { font-family: 'Orbitron'; font-size: 1.3rem; color: #fff; margin: 0 0 0.5rem 0; }
                .card-desc { font-size: 0.75rem; opacity: 0.5; line-height: 1.5; margin-bottom: 1.5rem; }
                
                .feature-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .feature-item { font-size: 0.6rem; display: flex; align-items: center; gap: 8px; opacity: 0.8; }
                .feature-dot { width: 3px; height: 3px; background: var(--active-color); border-radius: 50%; }
                .card-action { padding: 0.8rem; text-align: center; background: rgba(255,255,255,0.02); font-size: 0.55rem; letter-spacing: 2px; font-weight: 900; color: var(--active-color); }

                .footer-hud { display: flex; justify-content: space-between; align-items: flex-end; }
                .sys-log { font-size: 0.5rem; opacity: 0.4; line-height: 1.8; }
                .status-blink { color: var(--active-color); opacity: 1; }
                .dot { display: inline-block; width: 4px; height: 4px; background: currentColor; border-radius: 50%; animation: blink 1s infinite; margin-right: 5px; }
                .time-box { font-family: 'Orbitron'; font-size: 0.65rem; color: #fff; opacity: 0.6; }

                .transition-overlay { position: fixed; inset: 0; z-index: 1000; background: #000; display: flex; align-items: center; justify-content: center; }
                .loading-wrap { width: 250px; text-align: center; }
                .glitch-text { font-family: 'Orbitron'; font-size: 0.8rem; letter-spacing: 6px; color: var(--active-color); }
                .load-bar { width: 100%; height: 1px; background: rgba(255,255,255,0.1); margin-top: 20px; }
                .load-fill { height: 100%; background: var(--active-color); animation: load-anim 2.5s forwards; }

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
