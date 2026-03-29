import React, { useEffect, useRef, useState } from 'react';
import BackButton from './BackButton';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/** * CONFIGURATION & THEME
 */
const DIAMOND_COUNT = 10;
const THEME = {
    background: '#050201',
    lava: '#ff4500',
    accent: '#ff6600',
};

const DATA_POOL = [
    { name: "NEURAL_LINK", code: "AX-01", tagline: "Synaptic Processing" },
    { name: "VOID_CORE", code: "VX-99", tagline: "Dark Matter Research" },
    { name: "QUANTUM_FLUX", code: "QX-05", tagline: "Probabilistic Logic" },
    { name: "PLASMA_GRID", code: "PX-12", tagline: "High Energy Systems" },
    { name: "BIO_SYNTH", code: "BX-07", tagline: "Organic Computing" },
    { name: "CHRONOS", code: "CX-88", tagline: "Temporal Sequencing" },
    { name: "AETHER", code: "EX-21", tagline: "Atmospheric Analytics" },
    { name: "SOLARIS", code: "SX-44", tagline: "Star Energy Harvesting" },
    { name: "OMEGA_POINT", code: "OX-00", tagline: "Finality Simulation" },
    { name: "CYBER_MIND", code: "MX-33", tagline: "Sentience Grid" }
];

const GENERATED_DIAMONDS = Array.from({ length: DIAMOND_COUNT }).map((_, i) => {
    const data = DATA_POOL[i % DATA_POOL.length];
    return {
        id: `dia-${i}`,
        ...data,
        description: `Advanced system node ${i + 1} operating at peak efficiency within the nebula grid. High-frequency data transmission active.`,
        color: new THREE.Color().setHSL(i / DIAMOND_COUNT, 0.8, 0.55).getStyle(),
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 160,
            Math.random() * 10 + 10, // Keep them slightly elevated
            (Math.random() - 0.5) * 40
        ),
        rotationSpeed: 0.008 + Math.random() * 0.012
    };
});

export default function App() {
    const mountRef = useRef(null);
    const [view, setView] = useState('nebula'); 
    const [activeIdx, setActiveIdx] = useState(0);
    const [uiLabels, setUiLabels] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(70);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Sync state to ref for animation loop access without closure staling
    const reactiveState = useRef({ view, activeIdx, isPlaying });
    useEffect(() => {
        reactiveState.current = { view, activeIdx, isPlaying };
    }, [view, activeIdx, isPlaying]);

    const sceneState = useRef({
        mouse: new THREE.Vector2(),
        clock: new THREE.Clock(),
        raycaster: new THREE.Raycaster(),
        hoveredId: null,
        targetZoom: 70,
        zoom: 70,
        panOffset: new THREE.Vector2(0, 0),
        isDragging: false,
        lastMousePos: new THREE.Vector2(),
        currentCamPos: new THREE.Vector3(0, 40, 120),
        targetCamPos: new THREE.Vector3(0, 40, 120),
        lookAtTarget: new THREE.Vector3(0, 10, 0),
        currentLookAt: new THREE.Vector3(0, 10, 0),
        scrollAccumulator: 0,
        playTimer: 0
    });

    const adjustZoom = (delta) => {
        const newZoom = Math.min(Math.max(sceneState.current.targetZoom + delta, 30), 350);
        sceneState.current.targetZoom = newZoom;
        setZoomLevel(newZoom);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(THEME.background);
        scene.fog = new THREE.FogExp2(THEME.background, 0.004);
        
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 4000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xff6600, 0.3));
        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(100, 200, 100);
        scene.add(sun);

        // Floor Grid
        const gridGeo = new THREE.PlaneGeometry(4000, 4000, 80, 80);
        const gridMat = new THREE.MeshStandardMaterial({ 
            color: 0x110500, 
            emissive: 0xff2200, 
            emissiveIntensity: 0.15,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = -30;
        scene.add(grid);

        const octaGeo = new THREE.OctahedronGeometry(2.8);
        const ringGeo = new THREE.TorusGeometry(4.0, 0.06, 12, 64);

        const diamonds = GENERATED_DIAMONDS.map((data, i) => {
            const group = new THREE.Group();
            group.position.copy(data.pos);
            group.userData = { id: data.id, index: i };

            const core = new THREE.Mesh(octaGeo, new THREE.MeshStandardMaterial({ 
                color: data.color, 
                emissive: data.color, 
                emissiveIntensity: 1.8,
                metalness: 0.9,
                roughness: 0.05
            }));
            group.add(core);

            const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.5 }));
            ring.rotation.x = Math.PI / 2;
            group.add(ring);

            const pLight = new THREE.PointLight(data.color, 15, 50);
            group.add(pLight);

            scene.add(group);
            return { group, core, ring, pLight, data };
        });

        const partGeo = new THREE.BufferGeometry();
        const partPos = new Float32Array(3000 * 3);
        for(let i=0; i<3000; i++) {
            partPos[i*3] = (Math.random()-0.5)*1500;
            partPos[i*3+1] = (Math.random()-0.5)*1000;
            partPos[i*3+2] = (Math.random()-0.5)*1500;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.8, color: 0xff6600, transparent: true, opacity: 0.3 }));
        scene.add(particles);

        let rafId;
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            const delta = sceneState.current.clock.getDelta();
            const time = sceneState.current.clock.getElapsedTime();
            const state = sceneState.current;
            const { view: curView, activeIdx: curActiveIdx, isPlaying: curIsPlaying } = reactiveState.current;

            // Handle Autoplay Loop
            if (curIsPlaying && curView === 'nebula') {
                state.playTimer += delta;
                if (state.playTimer > 4.5) {
                    setActiveIdx(prev => (prev + 1) % DIAMOND_COUNT);
                    state.playTimer = 0;
                }
            } else {
                state.playTimer = 0;
            }

            state.raycaster.setFromCamera(state.mouse, camera);
            const intersects = state.raycaster.intersectObjects(scene.children, true);
            let foundHover = null;
            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while(obj.parent && obj.userData.index === undefined) obj = obj.parent;
                if(obj.userData.index !== undefined) foundHover = obj.userData.id;
            }
            state.hoveredId = foundHover;

            const activeData = GENERATED_DIAMONDS[curActiveIdx];
            state.zoom += (state.targetZoom - state.zoom) * 0.08;
            
            if (curView === 'nebula') {
                const panX = state.panOffset.x * 0.12;
                const panY = state.panOffset.y * 0.12;
                const swayX = Math.sin(time * 0.3) * 6;
                const swayY = Math.cos(time * 0.3) * 3;

                // Position camera slightly higher and back to prevent center-screen overlap with UI
                state.targetCamPos.set(
                    activeData.pos.x + panX + swayX,
                    activeData.pos.y + 25 + panY + swayY,
                    activeData.pos.z + state.zoom
                );
                state.lookAtTarget.set(activeData.pos.x, activeData.pos.y + 5, activeData.pos.z);
            } else {
                // Detail View: Move camera Left so subject is pushed Right
                state.targetCamPos.set(
                    activeData.pos.x - 18, 
                    activeData.pos.y + 5,
                    activeData.pos.z + 30
                );
                // Look at a point slightly to the right of the diamond to center it in the right viewport half
                state.lookAtTarget.set(activeData.pos.x + 6, activeData.pos.y, activeData.pos.z);
            }
            
            const lerpSpeed = curView === 'detail' ? 0.1 : 0.05;
            camera.position.lerp(state.targetCamPos, lerpSpeed);
            state.currentLookAt.lerp(state.lookAtTarget, lerpSpeed);
            camera.lookAt(state.currentLookAt);

            diamonds.forEach((d, i) => {
                const isHovered = state.hoveredId === d.data.id;
                const isActive = curActiveIdx === i;

                d.core.rotation.y += d.data.rotationSpeed * (isHovered ? 5 : 1.2);
                d.core.rotation.z += d.data.rotationSpeed * 0.6;
                d.core.position.y = Math.sin(time * 1.5 + i) * 1.5;
                
                d.ring.rotation.z += (isHovered || (isActive && curView === 'detail')) ? 0.12 : 0.04;
                const pulse = 1.0 + Math.sin(time * 2.5 + i) * 0.1;
                d.ring.scale.setScalar(isActive ? 1.6 * pulse : 1.1 * pulse);
                d.pLight.intensity = isActive ? (curView === 'detail' ? 40 : 20) : (isHovered ? 15 : 6);
            });

            const labels = GENERATED_DIAMONDS.map((d, i) => {
                const vec = d.pos.clone();
                vec.project(camera);
                const isVisible = vec.z < 1 && curView === 'nebula' && Math.abs(vec.x) < 0.85 && Math.abs(vec.y) < 0.85;
                return {
                    id: d.id,
                    x: (vec.x * 0.5 + 0.5) * window.innerWidth,
                    y: (-(vec.y * 0.5) + 0.5) * window.innerHeight,
                    visible: isVisible,
                    active: i === curActiveIdx
                };
            });
            setUiLabels(labels);

            gridMat.emissiveIntensity = 0.1 + Math.sin(time * 0.4) * 0.1;
            particles.rotation.y += 0.0006;
            renderer.render(scene, camera);
        };
        animate();

        const onMouseMove = (e) => {
            const state = sceneState.current;
            state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            if (state.isDragging && reactiveState.current.view === 'nebula') {
                state.panOffset.x -= (e.clientX - state.lastMousePos.x) * 1.5;
                state.panOffset.y += (e.clientY - state.lastMousePos.y) * 1.5;
                state.lastMousePos.set(e.clientX, e.clientY);
            }
        };

        const onMouseDown = (e) => {
            if (reactiveState.current.view === 'nebula') {
                sceneState.current.isDragging = true;
                sceneState.current.lastMousePos.set(e.clientX, e.clientY);
            }
        };

        const onMouseUp = () => { sceneState.current.isDragging = false; };

        const onWheel = (e) => {
            const state = sceneState.current;
            // Ctrl/Cmd + Scroll = Smooth Zoom
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                adjustZoom(e.deltaY * 0.6);
                return;
            }
            // Rapid scroll = switch diamond
            state.scrollAccumulator += e.deltaY;
            if (Math.abs(state.scrollAccumulator) > 400) {
                const dir = state.scrollAccumulator > 0 ? 1 : -1;
                setActiveIdx(prev => (prev + dir + DIAMOND_COUNT) % DIAMOND_COUNT);
                state.scrollAccumulator = 0;
                setIsPlaying(false);
            }
        };

        const onClick = (e) => {
            const state = sceneState.current;
            if (state.isDragging) {
                if (state.lastMousePos.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5) return;
            }
            const hovered = GENERATED_DIAMONDS.find(d => d.id === state.hoveredId);
            if (hovered) {
                const idx = GENERATED_DIAMONDS.indexOf(hovered);
                if (idx === reactiveState.current.activeIdx) {
                    setView(v => v === 'nebula' ? 'detail' : 'nebula');
                } else {
                    setActiveIdx(idx);
                }
            }
        };

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('click', onClick);
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (mountRef.current) mountRef.current.innerHTML = '';
        };
    }, []);

    const activeData = GENERATED_DIAMONDS[activeIdx];

    return (
        <div className="fixed inset-0 bg-[#050201] overflow-hidden text-white font-manrope select-none">
            <BackButton />
            {/* 3D Viewport */}
            <div ref={mountRef} className="absolute inset-0 z-0" />

            {/* Interaction Layer */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                
                {/* HUD Header */}
                <div className="absolute top-10 left-10 space-y-2 pointer-events-auto">
                    <h1 className="text-[10px] font-black tracking-[0.8em] text-orange-500 uppercase">SYNAPTIC_GRID // NEBULA_OS</h1>
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_10px_green]' : 'bg-orange-600'}`} />
                        <span className="text-[9px] font-mono text-white/50 tracking-[0.25em] uppercase">
                            {isPlaying ? 'SEQUENCE_AUTOPILOT_RUNNING' : 'MANUAL_CURSOR_OVERRIDE'}
                        </span>
                    </div>
                </div>

                {/* HUD Controls */}
                <div className="absolute top-10 right-10 flex flex-col gap-5 pointer-events-auto items-center">
                    <button 
                        onClick={togglePlay} 
                        className={`w-16 h-16 flex items-center justify-center backdrop-blur-3xl border border-white/10 rounded-full transition-all duration-500 ${isPlaying ? 'bg-orange-600 border-orange-400 shadow-xl' : 'bg-white/5 hover:bg-white/10 shadow-none'}`}
                        title="Toggle Autoplay"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                    
                    <div className="w-[1px] h-10 bg-gradient-to-b from-white/20 to-transparent" />
                    
                    <div className="flex flex-col gap-3 bg-black/40 backdrop-blur-3xl p-2.5 rounded-full border border-white/10 shadow-2xl">
                        <button onClick={() => adjustZoom(-30)} className="w-11 h-11 flex items-center justify-center hover:bg-orange-600/60 rounded-full transition-all text-xl font-light border border-transparent hover:border-orange-400">+</button>
                        <button onClick={() => { sceneState.current.targetZoom = 300; setZoomLevel(300); }} className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-[8px] font-black tracking-tighter">MAX</button>
                        <button onClick={() => adjustZoom(30)} className="w-11 h-11 flex items-center justify-center hover:bg-orange-600/60 rounded-full transition-all text-xl font-light border border-transparent hover:border-orange-400">−</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'nebula' ? (
                        <motion.div key="nebula" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                            {uiLabels.map((label) => {
                                const data = GENERATED_DIAMONDS.find(d => d.id === label.id);
                                if (!label.visible) return null;
                                return (
                                    <div key={label.id} className={`absolute transition-all duration-1000 pointer-events-none ${label.active ? 'opacity-100 scale-100' : 'opacity-10 scale-50'}`} style={{ left: label.x, top: label.y, transform: 'translate(-50%, -50%)' }}>
                                        {label.active && (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-orange-500/30 blur-[60px] rounded-full animate-pulse" />
                                                <div className="relative bg-black/80 backdrop-blur-3xl p-10 border border-white/15 rounded-[3rem] text-center min-w-[320px] shadow-2xl border-t-orange-500/50">
                                                    <div className="text-[10px] font-mono text-orange-500 mb-3 tracking-[0.5em] font-black">{data.code}</div>
                                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-3 leading-none">{data.name}</h2>
                                                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.4em]">{data.tagline}</p>
                                                    <div className="mt-8 flex justify-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600/30" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600/30" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {!label.active && <div className="w-14 h-14 border border-white/5 rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white/20 rounded-full" /></div>}
                                    </div>
                                );
                            })}

                            {/* Bottom Nav */}
                            <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-12 pointer-events-auto">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex gap-4 p-2.5 bg-black/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl">
                                        {GENERATED_DIAMONDS.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => { setActiveIdx(i); setIsPlaying(false); }} 
                                                className={`h-3.5 transition-all duration-700 rounded-full border border-white/5 ${i === activeIdx ? 'w-20 bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.6)]' : 'w-3.5 bg-white/10 hover:bg-white/30'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-[9px] font-mono text-white/20 animate-pulse tracking-[0.6em] uppercase">
                                    HOLD_SHIFT_TO_ZOOM // SCROLL_TO_TRAVEL
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="detail"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-start p-10 lg:pl-32"
                        >
                            <div className="w-full max-w-4xl flex flex-col items-start text-left pointer-events-auto">
                                <button 
                                    onClick={() => setView('nebula')}
                                    className="group flex items-center gap-8 text-[11px] font-black tracking-[0.6em] text-white/40 hover:text-orange-500 transition-all mb-20"
                                >
                                    EXIT_DIAGNOSTIC_MODE
                                    <span className="w-20 h-[1px] bg-white/10 group-hover:w-32 group-hover:bg-orange-500 transition-all duration-700" />
                                </button>
                                
                                <div className="space-y-16">
                                    <div className="flex flex-col items-start">
                                        <motion.span 
                                            initial={{ opacity: 0, x: -30 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            className="text-xl font-mono text-orange-600 mb-6 tracking-[0.7em] font-black"
                                        >
                                            {activeData.code}
                                        </motion.span>
                                        <h2 className="text-[10rem] lg:text-[14rem] font-black italic tracking-tighter leading-[0.75] uppercase overflow-visible">
                                            {activeData.name}<br/>
                                            <span style={{ color: activeData.color }} className="opacity-95 filter drop-shadow-[0_0_30px_rgba(255,100,0,0.4)]">CORE</span>
                                        </h2>
                                    </div>

                                    <div className="max-w-2xl bg-black/40 p-12 backdrop-blur-3xl border border-white/10 rounded-r-[3rem] shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-600" />
                                        <p className="text-3xl font-light leading-snug text-white/90">
                                            <span className="text-orange-500 font-black uppercase tracking-[0.3em] block mb-6 text-sm underline decoration-orange-600/30 underline-offset-8">{activeData.tagline}</span> 
                                            {activeData.description}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-12 pt-12 mt-12 border-t border-white/5">
                                            <div>
                                                <div className="text-[10px] font-mono text-white/30 uppercase mb-4 tracking-widest">SIGNAL_BURST</div>
                                                <div className="h-2 bg-white/5 w-full rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} className="h-full bg-orange-600 shadow-[0_0_10px_orange]" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono text-white/30 uppercase mb-4 tracking-widest">SYNCHRONICITY</div>
                                                <div className="h-2 bg-white/5 w-full rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <button className="group relative px-20 py-7 overflow-hidden rounded-full transition-all bg-white/5 border border-white/15 hover:border-orange-500/50">
                                            <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                                            <span className="relative text-[12px] font-black tracking-[0.7em] text-white group-hover:text-black">ACCESS_CORE_FILES</span>
                                        </button>
                                        <button className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,900;1,900&family=Manrope:wght@200;400;800&display=swap');
                body { margin: 0; background: #050201; font-family: 'Manrope', sans-serif; overflow: hidden; }
                h1, h2 { font-family: 'Epilogue', sans-serif; }
                * { transition: color 0.3s ease, border-color 0.3s ease; }
            `}</style>
        </div>
    );
}
