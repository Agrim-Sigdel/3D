import React, { useEffect, useRef, useState, useCallback } from 'react';
import BackButton from './BackButton';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/** * THEME DEFINITIONS
 */
const PALETTE = {
    cyan: 0x00f2ff,
    gold: 0xffcc00,
    purple: 0xaa00ff,
    dark: 0x01080e,
    grid: 0x0a192f,
    accent: 0x64ffda
};

const MODULES = [
    {
        id: 'fun',
        name: 'CREATIVE',
        code: 'CX-9',
        title: 'Creative Mode',
        description: 'Immersive animations and experimental UI components.',
        x: -8,
        z: -2,
        color: PALETTE.cyan,
        colorStr: '#00f2ff'
    },
    {
        id: 'work',
        name: 'TERMINAL',
        code: 'TX-1',
        title: 'Terminal Mode',
        description: 'High-efficiency developer environment and project logs.',
        x: 0,
        z: 0,
        color: PALETTE.gold,
        colorStr: '#ffcc00'
    },
    {
        id: 'normal',
        name: 'CLASSIC',
        code: 'CL-4',
        title: 'Classic Mode',
        description: 'Clean, minimalist presentation of professional data.',
        x: 8,
        z: -2,
        color: PALETTE.purple,
        colorStr: '#aa00ff'
    }
];

// --- Sub-Page Views ---

const PageWrapper = ({ children, onBack, bg = "bg-black" }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-0 z-[100] ${bg} flex flex-col`}
    >
        <div className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/20">
            <button onClick={onBack} className="group flex items-center gap-3 text-xs font-bold tracking-widest text-white/50 hover:text-white transition-colors">
                <span className="w-8 h-[1px] bg-white/20 group-hover:w-12 group-hover:bg-white transition-all"></span>
                RETURN_TO_CORE
            </button>
            <div className="text-[10px] text-white/20 font-mono">ENCRYPTED_SESSION_ACTIVE</div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
    </motion.div>
);

// --- Main Hub Component ---

export default function App() {
    const mountRef = useRef(null);
    const [currentPage, setCurrentPage] = useState('hub');
    const [activeIdx, setActiveIdx] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // Refs for smooth animation interpolation
    const sceneState = useRef({
        targetX: 0,
        currentX: 0,
        mouse: new THREE.Vector2(),
        clock: new THREE.Clock(),
        podiums: [],
        camera: null,
        renderer: null,
        scene: null
    });

    const initScene = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(PALETTE.dark);
        scene.fog = new THREE.FogExp2(PALETTE.dark, 0.035);
        
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(0, 6, 22);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambient);
        
        const spot = new THREE.SpotLight(0xffffff, 2);
        spot.position.set(10, 20, 10);
        spot.angle = 0.3;
        spot.penumbra = 1;
        scene.add(spot);

        // Ground Grid with depth
        const grid = new THREE.GridHelper(100, 50, PALETTE.accent, 0x05101a);
        grid.position.y = -4;
        grid.material.transparent = true;
        grid.material.opacity = 0.2;
        scene.add(grid);

        // Particles
        const partGeo = new THREE.BufferGeometry();
        const partCount = 2000;
        const posArray = new Float32Array(partCount * 3);
        for(let i=0; i < partCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 60;
        partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.04, color: 0x64ffda, transparent: true, opacity: 0.4 }));
        scene.add(particles);

        // Podium Construction
        const podiums = MODULES.map((mod, i) => {
            const group = new THREE.Group();
            group.position.set(mod.x, -4, mod.z);

            // Base
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 2.5, 0.8, 32),
                new THREE.MeshStandardMaterial({ color: 0x020a12, metalness: 0.9, roughness: 0.1 })
            );
            group.add(base);

            // Floating Core
            const core = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.5, 1.5),
                new THREE.MeshStandardMaterial({ 
                    color: mod.color, 
                    emissive: mod.color, 
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.8
                })
            );
            core.position.y = 4;
            group.add(core);

            // Large Aura Rings
            const ringGeo = new THREE.TorusGeometry(3, 0.02, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({ color: mod.color, transparent: true, opacity: 0.2 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 4;
            group.add(ring);

            scene.add(group);
            return { group, core, ring, id: mod.id };
        });

        sceneState.current = { ...sceneState.current, scene, camera, renderer, podiums, particles };

        const animate = () => {
            const frame = requestAnimationFrame(animate);
            const time = sceneState.current.clock.getElapsedTime();

            // Smoothly move target X based on active index
            sceneState.current.currentX = THREE.MathUtils.lerp(
                sceneState.current.currentX, 
                MODULES[activeIdx].x, 
                0.05
            );

            // Camera follow with organic lag
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, sceneState.current.currentX + (sceneState.current.mouse.x * 2), 0.04);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 6 + (sceneState.current.mouse.y * 1), 0.04);
            camera.lookAt(sceneState.current.currentX, 2, -5);

            // Animate Podium Elements
            podiums.forEach((p, i) => {
                const isHovered = i === activeIdx;
                const scale = isHovered ? 1.2 : 0.8;
                p.group.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
                
                p.core.rotation.y += 0.01;
                p.core.rotation.z += 0.005;
                p.core.position.y = 4 + Math.sin(time + i) * 0.3;
                
                p.ring.rotation.x = Math.PI/2 + Math.sin(time * 0.5) * 0.1;
                p.ring.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
            });

            particles.rotation.y += 0.0005;

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const handleMouseMove = (e) => {
            sceneState.current.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            sceneState.current.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animate);
            renderer.dispose();
        };
    }, [activeIdx]);

    useEffect(() => {
        if (currentPage === 'hub') return initScene();
    }, [currentPage, initScene]);

    const navigate = (dir) => {
        if (isTransitioning) return;
        const newIdx = Math.max(0, Math.min(MODULES.length - 1, activeIdx + dir));
        setActiveIdx(newIdx);
    };

    const enterMode = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentPage(MODULES[activeIdx].id);
            setIsTransitioning(false);
        }, 1000);
    };

    return (
        <div className="content-hub fixed inset-0 bg-[#01080e] overflow-hidden font-sans text-white select-none">
            <BackButton />
            
            {/* 3D Render Layer */}
            <div ref={mountRef} className="absolute inset-0 z-0" />

            {/* Cinematic Overlay UI */}
            <AnimatePresence>
                {currentPage === 'hub' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: 'brightness(3)' }}
                        className="relative z-10 h-full flex flex-col justify-between p-8 pointer-events-none"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="pointer-events-auto">
                                <h1 className="text-3xl font-black tracking-[0.3em] opacity-80">AGRIM SIGDEL</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f2ff]"></div>
                                    <span className="text-[10px] font-mono tracking-widest text-cyan-400/60 uppercase">System Active // Core_Node_01</span>
                                </div>
                            </div>
                            <div className="text-right font-mono text-[10px] opacity-30">
                                PERSPECTIVE_RENDER_ENGINE_V4<br/>
                                LAT: 27.7172 | LNG: 85.3240
                            </div>
                        </div>

                        {/* Center Content - Floating 3D Text Style */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeIdx}
                                    initial={{ opacity: 0, y: 30, letterSpacing: '0.5em' }}
                                    animate={{ opacity: 1, y: 0, letterSpacing: '0.2em' }}
                                    exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="max-w-xl pointer-events-auto cursor-pointer"
                                    onClick={enterMode}
                                >
                                    <span className="text-[10px] font-bold text-cyan-400 mb-4 block tracking-[0.5em]">{MODULES[activeIdx].code}</span>
                                    <h2 className="text-6xl md:text-8xl font-black italic uppercase mb-4 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                        {MODULES[activeIdx].name}
                                    </h2>
                                    <p className="text-sm md:text-base font-light text-white/40 tracking-wide leading-relaxed">
                                        {MODULES[activeIdx].description}
                                    </p>
                                    <div className="mt-8 py-3 px-8 border border-white/10 rounded-full inline-block hover:bg-white hover:text-black transition-all group overflow-hidden relative">
                                        <span className="relative z-10 text-[10px] font-bold tracking-[0.2em]">INITIALIZE_SEQUENCE</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Bottom Controls */}
                        <div className="flex justify-between items-center pointer-events-auto">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => navigate(-1)} 
                                    disabled={activeIdx === 0}
                                    className={`w-12 h-12 flex items-center justify-center border rounded-full transition-all ${activeIdx === 0 ? 'opacity-10 border-white/5' : 'opacity-100 border-white/20 hover:border-white hover:bg-white/5'}`}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                <button 
                                    onClick={() => navigate(1)} 
                                    disabled={activeIdx === MODULES.length - 1}
                                    className={`w-12 h-12 flex items-center justify-center border rounded-full transition-all ${activeIdx === MODULES.length - 1 ? 'opacity-10 border-white/5' : 'opacity-100 border-white/20 hover:border-white hover:bg-white/5'}`}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                            </div>
                            
                            <div className="flex gap-2">
                                {MODULES.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1 transition-all duration-500 ${i === activeIdx ? 'w-12 bg-white' : 'w-4 bg-white/10'}`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-Pages Implementation */}
            <AnimatePresence>
                {currentPage === 'work' && (
                    <PageWrapper onBack={() => setCurrentPage('hub')}>
                        <div className="max-w-5xl mx-auto py-20 px-8 font-mono">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl">TX</div>
                                <div>
                                    <h2 className="text-4xl font-bold uppercase tracking-tighter">Terminal_Logs</h2>
                                    <p className="text-yellow-500/50 text-xs">Accessing sensitive developer assets...</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm opacity-80">
                                <div className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> CORE_TECH_STACK
                                    </h3>
                                    <div className="space-y-2 text-xs opacity-60">
                                        <p>&gt; React / Next.js / TypeScript</p>
                                        <p>&gt; Python / Django / FastAPI</p>
                                        <p>&gt; PyTorch / YOLOv8 / OpenCV</p>
                                        <p>&gt; PostgreSQL / Redis / Docker</p>
                                    </div>
                                </div>
                                <div className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span> PROJECT_DEPLOYMENTS
                                    </h3>
                                    <ul className="space-y-4">
                                        <li>
                                            <div className="font-bold">ANPR_v2.0</div>
                                            <div className="text-[10px] opacity-40">Automated number plate recognition with 98% accuracy.</div>
                                        </li>
                                        <li>
                                            <div className="font-bold">SENTIMENT_ANALYSIS_ENGINE</div>
                                            <div className="text-[10px] opacity-40">NLP model processing 5k requests/min.</div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </PageWrapper>
                )}

                {currentPage === 'normal' && (
                    <PageWrapper onBack={() => setCurrentPage('hub')} bg="bg-white text-black">
                        <div className="max-w-4xl mx-auto py-24 px-8">
                            <h2 className="text-8xl font-black mb-12 tracking-tighter">Agrim.</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                                <div>
                                    <p className="text-2xl font-light leading-relaxed mb-12">
                                        A developer focused on building <span className="font-bold">intelligent systems</span> that feel like magic.
                                    </p>
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-2">Currently</h4>
                                            <p className="font-medium">Full-Stack Developer @ Kingsoft Tech</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-2">Previously</h4>
                                            <p className="font-medium">Creative Lead @ Prime College</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="h-[1px] bg-black/10 w-full mb-8"></div>
                                    <p className="text-sm text-black/50">Based in Kathmandu, Nepal. Working worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </PageWrapper>
                )}

                {currentPage === 'fun' && (
                    <PageWrapper onBack={() => setCurrentPage('hub')} bg="bg-indigo-600">
                        <div className="h-full flex items-center justify-center p-8 overflow-hidden relative">
                             <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute w-[800px] h-[800px] border border-white/20 rounded-full"
                             />
                             <div className="text-center relative z-10">
                                <h2 className="text-[15vw] font-black italic tracking-tighter leading-none opacity-20">EXPERIMENT</h2>
                                <p className="text-2xl font-mono mt-[-2rem] tracking-[1em]">PLAYGROUND_V1</p>
                             </div>
                        </div>
                    </PageWrapper>
                )}
            </AnimatePresence>

            {/* Global Loader */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="w-24 h-[1px] bg-white/20 relative overflow-hidden">
                            <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-white"
                            />
                        </div>
                        <span className="mt-4 text-[10px] tracking-[0.5em] font-bold text-white/50">SYNCHRONIZING_NODE</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .content-hub { font-family: 'Inter', sans-serif; }

                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
