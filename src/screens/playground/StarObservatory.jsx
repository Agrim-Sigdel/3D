import React, { useRef, useState } from 'react';
import BackButton from '../BackButton';
import { useThreeScene, useLatest } from '../../hooks/useThreeScene.js';
import * as THREE_LIB from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const THREE = THREE_LIB;

/**
 * CONFIGURATION & THEME
 * Inspired by the deep pink/purple nebula and multi-colored faceted stars
 */
const NODE_COUNT = 12;
const THEME = {
    bgDark: '#0a0208',        
    nebulaPrimary: '#8a1c5a',  // Deep Magenta
    nebulaSecondary: '#2e104a', // Dark Purple
    accent: '#f472b6',         
    textMain: '#fff1f2',       
    textMuted: '#9d174d'        
};

const DATA_POOL = [
    { name: "CYAN_DWARR", code: "CD-01", class: "Luminous Entity", desc: "A piercing cyan star-crystal emitting high-frequency chronal waves." },
    { name: "AMBER_RELIC", code: "AR-02", class: "Solar Shard", desc: "Forged in the heart of a dying sun, this amber diamond retains immense thermal energy." },
    { name: "SAPPHIRE_VOID", code: "SV-03", class: "Deep Space Core", desc: "A cobalt-blue anomaly that absorbs nearby light, reflecting only the deepest void." },
    { name: "EMERALD_NEXUS", code: "EN-04", class: "Bio-Organic Star", desc: "Vibrant green faceted core pulsating with what appears to be rhythmic life signals." },
    { name: "RUBY_FRACTURE", code: "RF-05", class: "Kinetics Anomaly", desc: "Sharp crimson edges that warp the trajectory of passing matter." },
    { name: "GOLDEN_PULSE", code: "GP-06", class: "Aetheric Beacon", desc: "A brilliant golden star-gem serving as a navigational anchor in the nebula." },
];

const COLORS = [
    0x00ffff, // Cyan
    0xffaa00, // Amber
    0x2244ff, // Blue
    0x00ff88, // Emerald
    0xff2266, // Ruby
    0xffdd44  // Gold
];

const GENERATED_NODES = Array.from({ length: NODE_COUNT }).map((_, i) => {
    const data = DATA_POOL[i % DATA_POOL.length];
    const colorHex = COLORS[i % COLORS.length];
    return {
        id: `node-${i}`,
        ...data,
        color: new THREE.Color(colorHex),
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 120,
            (Math.random() - 0.5) * 150
        ),
        baseRotation: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
        speedMult: 0.4 + Math.random() * 0.6,
        // Rolled once per node. Generating these in the detail card would
        // reshuffle the readout on every re-render.
        luminosity: (Math.random() * 100 + 40).toFixed(1),
        massDensity: (Math.random() * 5 + 1).toFixed(2)
    };
});

const NebulaShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(THEME.nebulaPrimary) },
        uColor2: { value: new THREE.Color(THEME.nebulaSecondary) },
        uOpacity: { value: 0.4 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uOpacity;
        varying vec2 vUv;

        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ; m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 a0 = x - floor(x + 0.5);
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = vUv;
            float n1 = snoise(uv * 1.2 + uTime * 0.015);
            float n2 = snoise(uv * 3.0 - uTime * 0.03);
            float noise = n1 * 0.6 + n2 * 0.4;
            float edgeFade = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
            edgeFade *= smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
            vec3 color = mix(uColor1, uColor2, clamp(noise * 0.9 + 0.5, 0.0, 1.0));
            gl_FragColor = vec4(color, (noise * 0.5 + 0.5) * uOpacity * edgeFade);
        }
    `
};

export default function App() {
    const [view, setView] = useState('overview'); 
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    // Read by the render loop, which must not be rebuilt when these change.
    const reactiveState = useLatest({ view, activeIdx, isPlaying });

    const sceneState = useRef({
        mouse: new THREE.Vector2(),
        raycaster: new THREE.Raycaster(),
        hoveredIdx: null,
        targetZoom: 180,
        zoom: 180,
        panOffset: new THREE.Vector2(0, 0),
        isDragging: false,
        lastMousePos: new THREE.Vector2(),
        currentCamPos: new THREE.Vector3(0, 0, 200),
        targetCamPos: new THREE.Vector3(0, 0, 200),
        currentLookAt: new THREE.Vector3(0, 0, 0),
        targetLookAt: new THREE.Vector3(0, 0, 0),
        scrollAcc: 0,
        playTimer: 0
    });

    const handleZoom = (delta) => {
        sceneState.current.targetZoom = Math.min(Math.max(sceneState.current.targetZoom + delta, 60), 450);
    };

    const mountRef = useThreeScene(({ scene, camera }) => {
        scene.fog = new THREE.FogExp2(THEME.bgDark, 0.001);

        scene.add(new THREE.AmbientLight(0xffffff, 0.1));
        
        // Dynamic nebula background clouds
        const nebulaClouds = [];
        const nebulaGeo = new THREE.PlaneGeometry(1500, 1000);
        for(let i = 0; i < 15; i++) {
            const mat = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(NebulaShader.uniforms),
                vertexShader: NebulaShader.vertexShader,
                fragmentShader: NebulaShader.fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            // Assign pink/purple variance
            if (i % 2 === 0) mat.uniforms.uColor1.value.setHex(0xbc1a6e); 
            else mat.uniforms.uColor1.value.setHex(0x4c1d95); 
            
            const cloud = new THREE.Mesh(nebulaGeo, mat);
            cloud.position.set((Math.random() - 0.5) * 1500, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 800 - 300);
            cloud.rotation.z = Math.random() * Math.PI;
            cloud.scale.setScalar(0.8 + Math.random() * 2.2);
            scene.add(cloud);
            nebulaClouds.push({ mesh: cloud, speed: (Math.random() - 0.5) * 0.02 });
        }

        // Starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 12000;
        const sPos = new Float32Array(starCount * 3);
        const sColor = new Float32Array(starCount * 3);
        for(let i=0; i<starCount; i++) {
            const r = 1000 + Math.random() * 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            sPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            sPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            sPos[i*3+2] = r * Math.cos(phi);
            
            // Varied star colors (blues, oranges, whites)
            const starType = Math.random();
            if(starType > 0.8) { sColor[i*3]=0.7; sColor[i*3+1]=0.9; sColor[i*3+2]=1.0; } // blue
            else if(starType > 0.6) { sColor[i*3]=1.0; sColor[i*3+1]=0.8; sColor[i*3+2]=0.6; } // amber
            else { sColor[i*3]=1; sColor[i*3+1]=1; sColor[i*3+2]=1; }
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(sColor, 3));
        const starMat = new THREE.PointsMaterial({ vertexColors: true, size: 1.5, transparent: true, opacity: 0.8, sizeAttenuation: true });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // Diamonds (Faceted Stars)
        const nodes = GENERATED_NODES.map((data, i) => {
            const group = new THREE.Group();
            group.position.copy(data.pos);
            group.userData = { id: data.id, index: i };
            
            // The Faceted "Diamond" Core
            const coreGeo = new THREE.OctahedronGeometry(5, 0); // Sharp 8-sided diamond
            const coreMat = new THREE.MeshStandardMaterial({ 
                color: data.color, 
                emissive: data.color, 
                emissiveIntensity: 2.5,
                metalness: 1, 
                roughness: 0,
                flatShading: true 
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            // Glowing Outer Facets
            const shell = new THREE.Mesh(
                new THREE.OctahedronGeometry(6.5, 0),
                new THREE.MeshBasicMaterial({ color: data.color, wireframe: true, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending })
            );
            group.add(shell);

            // Cross-Flare (The "+" star effect)
            const flareGeo = new THREE.PlaneGeometry(35, 1.2);
            const flareMat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
            const flareH = new THREE.Mesh(flareGeo, flareMat);
            const flareV = new THREE.Mesh(flareGeo, flareMat);
            flareV.rotation.z = Math.PI / 2;
            const flareGroup = new THREE.Group();
            flareGroup.add(flareH, flareV);
            group.add(flareGroup);

            const light = new THREE.PointLight(data.color, 25, 150);
            group.add(light);
            
            const hitArea = new THREE.Mesh(
                new THREE.SphereGeometry(15, 8, 8),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
            );
            hitArea.userData = { index: i };
            group.add(hitArea);

            scene.add(group);
            return { group, core, shell, flareGroup, light, data, hitArea };
        });

        const frame = ({ time, delta }) => {
            const st = sceneState.current;
            const { view: curView, activeIdx: curActiveIdx, isPlaying: curIsPlaying } = reactiveState.current;

            nebulaClouds.forEach((cloud, i) => {
                cloud.mesh.material.uniforms.uTime.value = time * 0.1 + i;
                cloud.mesh.rotation.z += cloud.speed * delta;
            });
            stars.rotation.y = time * 0.0003;

            st.raycaster.setFromCamera(st.mouse, camera);
            const intersects = st.raycaster.intersectObjects(nodes.map(n => n.hitArea));
            if (intersects.length > 0) {
                st.hoveredIdx = intersects[0].object.userData.index;
                setIsHovering(true);
            } else {
                st.hoveredIdx = null;
                setIsHovering(false);
            }

            if (curIsPlaying && curView === 'overview') {
                st.playTimer += delta;
                if (st.playTimer > 6.0) { 
                    setActiveIdx(prev => (prev + 1) % NODE_COUNT);
                    st.playTimer = 0;
                }
            }

            const activeNode = nodes[curActiveIdx];
            st.zoom += (st.targetZoom - st.zoom) * 0.05;
            
            if (curView === 'overview') {
                const panX = st.panOffset.x * 0.15;
                const panY = st.panOffset.y * 0.15;
                const swayX = Math.sin(time * 0.3) * 15;
                const swayY = Math.cos(time * 0.2) * 10;
                st.targetCamPos.set(activeNode.data.pos.x + swayX + panX, activeNode.data.pos.y + 30 + swayY + panY, activeNode.data.pos.z + st.zoom);
                st.targetLookAt.copy(activeNode.data.pos);
            } else {
                st.targetCamPos.set(activeNode.data.pos.x - 20, activeNode.data.pos.y + 5, activeNode.data.pos.z + 30);
                st.targetLookAt.set(activeNode.data.pos.x, activeNode.data.pos.y, activeNode.data.pos.z);
            }
            
            camera.position.lerp(st.targetCamPos, 0.04);
            st.currentLookAt.lerp(st.targetLookAt, 0.04);
            camera.lookAt(st.currentLookAt);

            nodes.forEach((n, i) => {
                const isActive = curActiveIdx === i;
                const isHovered = st.hoveredIdx === i;
                const spd = n.data.speedMult * delta;
                
                n.core.rotation.y += spd;
                n.core.rotation.x += spd * 0.5;
                n.shell.rotation.y -= spd * 1.5;
                
                // Pulsing glow
                const pulse = 1.0 + Math.sin(time * 4 + i) * 0.15;
                n.core.scale.setScalar(pulse);
                
                // Star flare always faces camera
                n.flareGroup.quaternion.copy(camera.quaternion);
                n.flareGroup.scale.setScalar(pulse * (isActive ? 1.5 : 1.0));
                n.flareGroup.children.forEach(f => f.material.opacity = (isActive ? 0.8 : (isHovered ? 0.6 : 0.3)));

                const targetScale = isActive ? 1.6 : (isHovered ? 1.3 : 1.0);
                n.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
                n.light.intensity = (isActive ? 40 : (isHovered ? 20 : 8)) * pulse;
                n.group.position.y = n.data.pos.y + Math.sin(time + i) * 5;
            });

        };

        // Event Listeners
        const onMouseMove = (e) => {
            const st = sceneState.current;
            st.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            st.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            if (st.isDragging && reactiveState.current.view === 'overview') {
                st.panOffset.x -= (e.clientX - st.lastMousePos.x) * 1.5;
                st.panOffset.y += (e.clientY - st.lastMousePos.y) * 1.5;
                st.lastMousePos.set(e.clientX, e.clientY);
            }
        };

        const onMouseDown = (e) => { 
            const st = sceneState.current;
            if (st.hoveredIdx !== null) {
                setActiveIdx(st.hoveredIdx);
                setIsPlaying(false);
                st.playTimer = 0;
                return;
            }
            if (reactiveState.current.view === 'overview') { 
                st.isDragging = true; 
                st.lastMousePos.set(e.clientX, e.clientY); 
            } 
        };

        const onDblClick = () => {
            const st = sceneState.current;
            if (st.hoveredIdx !== null) {
                setActiveIdx(st.hoveredIdx);
                setIsPlaying(false);
                setView('detail');
            }
        };

        const onMouseUp = () => { sceneState.current.isDragging = false; };
        
        const onWheel = (e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey) { e.preventDefault(); handleZoom(e.deltaY * 0.5); return; }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('dblclick', onDblClick);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('wheel', onWheel, { passive: false });

        return {
            frame,
            dispose: () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('dblclick', onDblClick);
                window.removeEventListener('mouseup', onMouseUp);
                window.removeEventListener('wheel', onWheel);
            },
        };
    }, {
        background: THEME.bgDark,
        cameraFov: 50,
        cameraFar: 5000,
        toneMapping: THREE.ReinhardToneMapping,
        toneMappingExposure: 2.0,
    }, []);

    const activeNodeData = GENERATED_NODES[activeIdx];
    const activeColor = GENERATED_NODES[activeIdx].color.getStyle();

    return (
        <div className={`fixed inset-0 bg-[#0a0208] overflow-hidden text-[#fff1f2] font-sans select-none ${isHovering ? 'cursor-pointer' : 'cursor-default'}`}>
            <BackButton />
            <div ref={mountRef} className="absolute inset-0 z-0" />

            {/* UI LAYER */}
            <div className="relative z-50 w-full h-full pointer-events-none flex flex-col justify-between p-6 md:p-10">
                
                {/* HUD Header */}
                <header className="flex justify-between items-start pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-2xl">
                            <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]" style={{ backgroundColor: activeColor }} />
                        </div>
                        <div>
                            <h1 className="text-[10px] font-bold tracking-[0.5em] text-white/40 font-mono uppercase">STAR_OBSERVATORY</h1>
                            <p className="text-[14px] text-white font-semibold tracking-wide">OBJECT: {activeNodeData.code}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)} 
                            className={`h-10 px-5 flex items-center gap-3 text-[10px] font-bold tracking-widest border transition-all duration-500 backdrop-blur-3xl rounded-full ${isPlaying ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/30 text-red-200'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-white' : 'bg-red-400'}`} />
                            {isPlaying ? 'ORBITING' : 'STATIONARY'}
                        </button>
                    </div>
                </header>

                {/* CENTRAL CONTENT */}
                <div className="flex-1 relative flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {view === 'overview' && (
                            <motion.div 
                                key="overview" 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} 
                                className="pointer-events-auto absolute bottom-4 right-4 w-full max-w-[340px]"
                            >
                                <div className="p-8 bg-black/40 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: activeColor }} />
                                    <div className="relative z-10">
                                        <div className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase mb-2">Observation Link</div>
                                        <h3 className="text-3xl font-bold text-white mb-1">{activeNodeData.name}</h3>
                                        <p className="text-[11px] text-pink-400 font-bold tracking-widest uppercase mb-6">{activeNodeData.class}</p>
                                        <button 
                                            onClick={() => setView('detail')}
                                            className="w-full py-4 bg-white text-black font-black text-[12px] tracking-[0.1em] uppercase rounded-2xl hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Inspect Core
                                        </button>
                                        <p className="mt-4 text-center text-[8px] text-white/20 tracking-[0.2em] font-mono">DBL-CLICK NODE TO MAGNIFY</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === 'detail' && (
                            <motion.div 
                                key="detail" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="pointer-events-auto w-full max-w-xl"
                            >
                                <div className="bg-black/60 backdrop-blur-[60px] p-10 border border-white/10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                    <div className="flex flex-col gap-8">
                                        <header className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[11px] font-bold text-pink-500 tracking-[0.4em] uppercase mb-1">{activeNodeData.code}</div>
                                                <h2 className="text-5xl font-bold text-white tracking-tighter">{activeNodeData.name}</h2>
                                            </div>
                                            <button onClick={() => setView('overview')} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all border border-white/10">✕</button>
                                        </header>

                                        <p className="text-xl text-white/70 leading-relaxed font-light italic">"{activeNodeData.desc}"</p>

                                        <div className="grid grid-cols-2 gap-6">
                                            {[
                                                { label: "Spectral Class", val: "Type-Σ Crystal" },
                                                { label: "Luminosity", val: `${activeNodeData.luminosity} L☉` },
                                                { label: "Mass Density", val: `${activeNodeData.massDensity} ρ/cm³` },
                                                { label: "Temp (Core)", val: "18,400 K" }
                                            ].map((stat, idx) => (
                                                <div key={idx} className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{stat.label}</div>
                                                    <div className="text-xl font-bold text-white">{stat.val}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full py-6 bg-white/10 border border-white/10 text-white font-bold text-sm tracking-widest uppercase rounded-[2rem] hover:bg-white/20 transition-all">Download Spectral Data</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Footer */}
                <footer className="flex justify-center items-end pointer-events-auto pb-6">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full px-8 py-5 flex gap-8">
                        {GENERATED_NODES.map((n, i) => (
                            <button key={i} onClick={() => { setActiveIdx(i); setIsPlaying(false); }} className="relative group">
                                <div 
                                    className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeIdx ? 'scale-[2.5]' : 'scale-100 opacity-30 hover:opacity-100 hover:scale-150'}`}
                                    style={{ 
                                        backgroundColor: n.color.getStyle(),
                                        boxShadow: i === activeIdx ? `0 0 20px ${n.color.getStyle()}` : 'none'
                                    }}
                                />
                                {i === activeIdx && <motion.div layoutId="navActive" className="absolute -inset-2 border border-white/20 rounded-full" />}
                            </button>
                        ))}
                    </div>
                </footer>
            </div>
        </div>
    );
}
