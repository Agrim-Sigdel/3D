import React, { useEffect, useRef, useState, useCallback } from 'react';
import BackButton from './BackButton';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/** * THEME: INFINITE NEBULA
 */
const THEME = {
    background: '#050201',
    lava: '#ff4500',
    accent: '#ff6600',
};

// Procedural Data Generation
const DATA_POOL = [
    { name: "NEURAL_LINK", code: "AX-01", tagline: "Synaptic Processing", description: "Advanced interface for biological and synthetic neural integration. Optimizing latency across distributed synaptic nodes." },
    { name: "VOID_CORE", code: "VX-99", tagline: "Dark Matter Research", description: "Harnessing zero-point energy from vacuum fluctuations. Monitoring containment stability in sector 7G." },
    { name: "QUANTUM_FLUX", code: "QX-05", tagline: "Probabilistic Logic", description: "Calculating recursive probabilities across parallel compute instances. Entanglement density is currently at 98%." },
    { name: "PLASMA_GRID", code: "PX-12", tagline: "High Energy Systems", description: "Managing thermal dissipation for planetary-scale power distribution. Current load balancing at optimal efficiency." },
    { name: "BIO_SYNTH", code: "BX-07", tagline: "Organic Computing", description: "Synthesizing carbon-based logic gates for high-resilience environments. Growth patterns exceeding expectations." },
    { name: "CHRONOS", code: "CX-88", tagline: "Temporal Sequencing", description: "Aligning chronological data points to prevent causal paradoxes in high-speed data transmission." },
    { name: "AETHER", code: "EX-21", tagline: "Atmospheric Analytics", description: "Scanning global particulate density and ionic composition. Environmental equilibrium is stable." },
    { name: "SOLARIS", code: "SX-44", tagline: "Star Energy Harvesting", description: "Direct fusion-to-grid conversion protocols. Monitoring solar flare activity for surge protection." },
];

// Reduced diamond count for a cleaner, more focused UI
const DIAMOND_COUNT = 8;

const GENERATED_DIAMONDS = Array.from({ length: DIAMOND_COUNT }).map((_, i) => {
    const data = DATA_POOL[i % DATA_POOL.length];
    return {
        id: `dia-${i}`,
        ...data,
        name: `${data.name}`,
        color: new THREE.Color().setHSL(i / DIAMOND_COUNT, 0.8, 0.6).getStyle(),
        // Diamonds placed in a more spread-out foreground range
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 140,
            Math.random() * 15 + 5,
            (Math.random() - 0.5) * 40
        ),
        rotationSpeed: 0.005 + Math.random() * 0.01
    };
});

export default function App() {
    const mountRef = useRef(null);
    const [view, setView] = useState('nebula'); // 'nebula' or 'detail'
    const [activeIdx, setActiveIdx] = useState(0);
    const [uiLabels, setUiLabels] = useState([]);
    
    const sceneState = useRef({
        mouse: new THREE.Vector2(),
        clock: new THREE.Clock(),
        raycaster: new THREE.Raycaster(),
        hoveredId: null,
        zoom: 40,
        targetZoom: 40,
        panOffset: new THREE.Vector2(0, 0),
        isDragging: false,
        lastMousePos: new THREE.Vector2(),
        currentCamPos: new THREE.Vector3(0, 20, 50),
        targetCamPos: new THREE.Vector3(0, 20, 50),
        lookAtTarget: new THREE.Vector3(0, 10, 0),
        currentLookAt: new THREE.Vector3(0, 10, 0)
    });

    const initScene = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(THEME.background);
        scene.fog = new THREE.FogExp2(THEME.background, 0.015);
        
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xff4500, 0.4));
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(20, 100, 20);
        scene.add(sun);

        // Lava Sea (Background)
        const seaGeo = new THREE.PlaneGeometry(2500, 2500, 60, 60);
        const seaMat = new THREE.MeshStandardMaterial({ 
            color: 0x080201, 
            emissive: 0xff3300, 
            emissiveIntensity: 0.3,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const sea = new THREE.Mesh(seaGeo, seaMat);
        sea.rotation.x = -Math.PI / 2;
        sea.position.y = -20;
        scene.add(sea);

        const diamonds = GENERATED_DIAMONDS.map((data, i) => {
            const group = new THREE.Group();
            group.position.copy(data.pos);
            group.userData = { id: data.id, index: i };

            const core = new THREE.Mesh(
                new THREE.OctahedronGeometry(1.8), // Slightly larger due to fewer items
                new THREE.MeshStandardMaterial({ 
                    color: data.color, 
                    emissive: data.color, 
                    emissiveIntensity: 3,
                    metalness: 1,
                    roughness: 0.05
                })
            );
            group.add(core);

            const innerRing = new THREE.Mesh(
                new THREE.TorusGeometry(2.5, 0.05, 16, 100),
                new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.6 })
            );
            innerRing.rotation.x = Math.PI / 2;
            group.add(innerRing);

            const outerRing = new THREE.Mesh(
                new THREE.TorusGeometry(4.2, 0.02, 16, 100),
                new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.25 })
            );
            outerRing.rotation.x = Math.PI / 2;
            outerRing.rotation.y = Math.PI / 4;
            group.add(outerRing);

            const pLight = new THREE.PointLight(data.color, 12, 25);
            group.add(pLight);

            scene.add(group);
            return { group, core, innerRing, outerRing, pLight, data };
        });

        const partGeo = new THREE.BufferGeometry();
        const partPos = new Float32Array(2000 * 3);
        for(let i=0; i<2000; i++) {
            partPos[i*3] = (Math.random()-0.5)*1200;
            partPos[i*3+1] = (Math.random()-0.5)*1200;
            partPos[i*3+2] = (Math.random()-0.5)*1200;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.2 }));
        scene.add(particles);

        const animate = () => {
            requestAnimationFrame(animate);
            const time = sceneState.current.clock.getElapsedTime();

            sceneState.current.raycaster.setFromCamera(sceneState.current.mouse, camera);
            const intersects = sceneState.current.raycaster.intersectObjects(scene.children, true);
            
            if (intersects.length > 0 && view === 'nebula') {
                let obj = intersects[0].object;
                while(obj.parent && obj.userData.index === undefined) obj = obj.parent;
                if(obj.userData.index !== undefined) {
                    sceneState.current.hoveredId = obj.userData.id;
                    document.body.style.cursor = 'pointer';
                }
            } else {
                sceneState.current.hoveredId = null;
                document.body.style.cursor = sceneState.current.isDragging ? 'grabbing' : 'default';
            }

            const activeData = GENERATED_DIAMONDS[activeIdx];
            sceneState.current.zoom += (sceneState.current.targetZoom - sceneState.current.zoom) * 0.1;
            
            if (view === 'nebula') {
                const panX = sceneState.current.panOffset.x * 0.05;
                const panY = sceneState.current.panOffset.y * 0.05;
                sceneState.current.targetCamPos.set(
                    activeData.pos.x + panX,
                    activeData.pos.y + 10 + panY,
                    activeData.pos.z + sceneState.current.zoom
                );
            } else {
                sceneState.current.targetCamPos.copy(activeData.pos).add(new THREE.Vector3(12, 3, 14));
            }
            
            sceneState.current.lookAtTarget.copy(activeData.pos);

            const lerpSpeed = view === 'detail' ? 0.08 : 0.05;
            camera.position.lerp(sceneState.current.targetCamPos, lerpSpeed);
            sceneState.current.currentLookAt.lerp(sceneState.current.lookAtTarget, lerpSpeed);
            camera.lookAt(sceneState.current.currentLookAt);

            diamonds.forEach((d, i) => {
                const isHovered = sceneState.current.hoveredId === d.data.id;
                const isActive = activeIdx === i;

                d.core.rotation.y += d.data.rotationSpeed * (isHovered ? 6 : 1);
                d.core.position.y = Math.sin(time + i) * 0.7;
                
                d.innerRing.rotation.z += (isHovered || (isActive && view === 'detail')) ? 0.12 : 0.04;
                d.innerRing.scale.setScalar(isActive ? 1.3 : (1.0 + Math.sin(time * 2 + i) * 0.1));
                
                d.outerRing.rotation.z -= isHovered ? 0.06 : 0.02;
                d.pLight.intensity = isActive ? (view === 'detail' ? 30 : 15) : (isHovered ? 10 : 3);
            });

            const newLabels = GENERATED_DIAMONDS.map((d, i) => {
                const vec = d.pos.clone();
                vec.project(camera);
                return {
                    id: d.id,
                    x: (vec.x * 0.5 + 0.5) * window.innerWidth,
                    y: (-(vec.y * 0.5) + 0.5) * window.innerHeight,
                    visible: vec.z < 1 && view === 'nebula' && Math.abs(vec.x) < 1 && Math.abs(vec.y) < 1,
                    active: i === activeIdx
                };
            });
            setUiLabels(newLabels);

            seaMat.emissiveIntensity = 0.2 + Math.sin(time * 0.5) * 0.1;
            renderer.render(scene, camera);
        };
        animate();

        const handleMouseMove = (e) => {
            sceneState.current.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            sceneState.current.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            if (sceneState.current.isDragging && view === 'nebula') {
                const deltaX = e.clientX - sceneState.current.lastMousePos.x;
                const deltaY = e.clientY - sceneState.current.lastMousePos.y;
                sceneState.current.panOffset.x -= deltaX;
                sceneState.current.panOffset.y += deltaY;
                sceneState.current.lastMousePos.set(e.clientX, e.clientY);
            }
        };

        const handleMouseDown = (e) => {
            if (view === 'nebula') {
                sceneState.current.isDragging = true;
                sceneState.current.lastMousePos.set(e.clientX, e.clientY);
            }
        };

        const handleMouseUp = () => { sceneState.current.isDragging = false; };

        const handleWheel = (e) => {
            if (view === 'nebula') {
                sceneState.current.targetZoom = Math.min(Math.max(sceneState.current.targetZoom + e.deltaY * 0.05, 10), 200);
            }
        };

        const handleClick = () => {
            if (sceneState.current.isDragging) return;
            const hovered = GENERATED_DIAMONDS.find(d => d.id === sceneState.current.hoveredId);
            if(hovered) {
                const idx = GENERATED_DIAMONDS.indexOf(hovered);
                if (idx === activeIdx) {
                    setView('detail');
                } else {
                    setActiveIdx(idx);
                    sceneState.current.panOffset.set(0, 0);
                }
            }
        };

        const handleKeyDown = (e) => {
            if(e.key === 'Escape') {
                setView('nebula');
                sceneState.current.targetZoom = 40;
                sceneState.current.panOffset.set(0, 0);
            }
            if(view === 'nebula') {
                if(e.key === 'ArrowRight' || e.key === 'd') setActiveIdx(prev => (prev + 1) % GENERATED_DIAMONDS.length);
                if(e.key === 'ArrowLeft' || e.key === 'a') setActiveIdx(prev => (prev - 1 + GENERATED_DIAMONDS.length) % GENERATED_DIAMONDS.length);
                if(e.key === 'Enter') setView('detail');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
            renderer.dispose();
        };
    }, [activeIdx, view]);

    useEffect(() => { initScene(); }, [initScene]);

    const activeData = GENERATED_DIAMONDS[activeIdx];

    return (
        <div className="fixed inset-0 bg-[#050201] overflow-hidden text-white font-manrope select-none">
            <BackButton />
            <div ref={mountRef} className="absolute inset-0 z-0" />

            <div className="relative z-10 w-full h-full pointer-events-none">
                
                <div className="absolute top-12 left-12 space-y-2 pointer-events-auto">
                    <h1 className="text-[10px] font-black tracking-[1em] text-orange-500/60 uppercase">CORE_SYNTAX // ACTIVE</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                            {view === 'nebula' ? 'Exploration Matrix' : 'Data Integrity: 100%'}
                        </span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'nebula' ? (
                        <motion.div 
                            key="nebula-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            {uiLabels.map((label) => {
                                const data = GENERATED_DIAMONDS.find(d => d.id === label.id);
                                if(!label.visible) return null;
                                return (
                                    <div 
                                        key={label.id}
                                        className={`absolute transition-all duration-300 pointer-events-none ${label.active ? 'opacity-100 scale-110 z-20' : 'opacity-10 z-10'}`}
                                        style={{ left: label.x, top: label.y, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div className="flex flex-col items-center">
                                            {label.active && (
                                                <div className="bg-black/80 backdrop-blur-2xl p-6 border border-white/10 rounded-2xl text-center min-w-[200px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                                    <span className="text-[10px] font-mono text-orange-500 mb-2 block tracking-widest">{data.code}</span>
                                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-1">{data.name}</h2>
                                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{data.tagline}</p>
                                                    <div className="mt-6 flex justify-center">
                                                        <div className="px-4 py-1.5 bg-white text-black text-[8px] font-black tracking-widest rounded-sm">OPEN_SHARD</div>
                                                    </div>
                                                </div>
                                            )}
                                            {!label.active && (
                                                <div className="w-4 h-4 border border-white/20 rotate-45" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-6 pointer-events-auto">
                                <div className="flex gap-3 px-8 py-3 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full">
                                    {GENERATED_DIAMONDS.map((_, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setActiveIdx(i)}
                                            className={`h-1.5 transition-all duration-500 rounded-full ${i === activeIdx ? 'w-12 bg-orange-500 shadow-[0_0_15px_#ff4500]' : 'w-3 bg-white/10 hover:bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-8 text-[8px] font-mono text-white/30 uppercase tracking-[0.4em]">
                                    <span>Scroll_Zoom</span>
                                    <span>Drag_Explore</span>
                                    <span>Click_Focus</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="detail-ui"
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 60, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-end p-12 lg:p-24"
                        >
                            <div className="w-full max-w-2xl flex flex-col items-end text-right pointer-events-auto">
                                <button 
                                    onClick={() => setView('nebula')}
                                    className="group flex items-center gap-6 text-[11px] font-black tracking-[0.6em] text-white/30 hover:text-orange-500 transition-all mb-16"
                                >
                                    <span className="w-16 h-[1px] bg-white/10 group-hover:w-24 group-hover:bg-orange-500 transition-all" />
                                    EXIT_ENVIRONMENT
                                </button>

                                <motion.div className="space-y-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-mono text-orange-500 mb-4 tracking-[0.8em]">{activeData.code}</span>
                                        <h2 className="text-8xl lg:text-[10rem] font-black italic tracking-tighter leading-[0.8] uppercase">
                                            {activeData.name}<br/>
                                            <span style={{ color: activeData.color }} className="opacity-90">SHARD</span>
                                        </h2>
                                    </div>

                                    <div className="max-w-lg ml-auto space-y-10">
                                        <p className="text-2xl font-light tracking-tight text-white/80 leading-relaxed">
                                            {activeData.tagline}: <span className="text-white/40">{activeData.description}</span>
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 border border-white/5 bg-white/[0.03] rounded-2xl">
                                                <div className="text-[10px] font-mono text-white/20 mb-2 tracking-widest uppercase">Sync State</div>
                                                <div className="text-xl font-bold text-green-400">ENCRYPTED</div>
                                            </div>
                                            <div className="p-6 border border-white/5 bg-white/[0.03] rounded-2xl">
                                                <div className="text-[10px] font-mono text-white/20 mb-2 tracking-widest uppercase">Node Priority</div>
                                                <div className="text-xl font-bold">CRITICAL</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <button className="px-16 py-5 bg-white text-black text-[11px] font-black tracking-[0.6em] rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-2xl">
                                            EXECUTE_PROTOCOL
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="absolute bottom-16 right-16 flex items-center gap-12 pointer-events-auto bg-black/20 backdrop-blur-md px-8 py-4 rounded-full border border-white/5">
                                <button 
                                    onClick={() => setActiveIdx(prev => (prev - 1 + GENERATED_DIAMONDS.length) % GENERATED_DIAMONDS.length)}
                                    className="text-[11px] font-black tracking-widest text-white/20 hover:text-white transition-colors"
                                >
                                    PREV
                                </button>
                                <div className="text-xs font-mono text-orange-500 tracking-tighter">
                                    NODE_{String(activeIdx + 1).padStart(2, '0')}
                                </div>
                                <button 
                                    onClick={() => setActiveIdx(prev => (prev + 1) % GENERATED_DIAMONDS.length)}
                                    className="text-[11px] font-black tracking-widest text-white/20 hover:text-white transition-colors"
                                >
                                    NEXT
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute inset-10 border border-white/5 pointer-events-none">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-orange-500/40" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-orange-500/40" />
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,900;1,900&family=Manrope:wght@200;400;800&family=JetBrains+Mono&display=swap');
                body { margin: 0; background: #050201; font-family: 'Manrope', sans-serif; overflow: hidden; cursor: default; }
                h1, h2 { font-family: 'Epilogue', sans-serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
