import React, { useEffect, useRef, useState } from 'react';
import * as THREE_LIB from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from './BackButton';

const THREE = THREE_LIB;

/**
 * CONFIGURATION & THEME
 */
const NODE_COUNT = 12;
const THEME = {
    bgDark: '#050402',        
    nebulaPrimary: '#1a3a3a',  
    nebulaSecondary: '#b45309', 
    accent: '#7dd3fc',         
    textMain: '#fef3c7',       
    textMuted: '#92400e'        
};

const GENERATED_NODES = Array.from({ length: NODE_COUNT }).map((_, i) => {
    const hue = i % 3 === 0 ? 0.5 : (i % 3 === 1 ? 0.08 : 0.55); 
    return {
        id: `node-${i}`,
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 280,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 120
        ),
        baseRotation: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
        speedMult: 0.5 + Math.random() * 0.8
    };
});

const NebulaShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(THEME.nebulaPrimary) },
        uColor2: { value: new THREE.Color(THEME.nebulaSecondary) },
        uOpacity: { value: 0.3 }
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
            float n1 = snoise(uv * 1.5 + uTime * 0.02);
            float n2 = snoise(uv * 4.0 - uTime * 0.04);
            float noise = n1 * 0.7 + n2 * 0.3;
            float edgeFade = smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x);
            edgeFade *= smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
            vec3 color = mix(uColor1, uColor2, clamp(noise * 0.8 + 0.5, 0.0, 1.0));
            float stars = pow(max(0.0, snoise(uv * 30.0 + uTime * 0.1)), 15.0) * 4.0;
            gl_FragColor = vec4(color + vec3(stars), (noise * 0.6 + 0.4) * uOpacity * edgeFade);
        }
    `
};

export default function App() {
    const mountRef = useRef(null);
    const [view, setView] = useState('overview'); 
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    
    const reactiveState = useRef({ view, activeIdx, isPlaying });
    useEffect(() => {
        reactiveState.current = { view, activeIdx, isPlaying };
    }, [view, activeIdx, isPlaying]);

    const sceneState = useRef({
        mouse: new THREE.Vector2(),
        clock: new THREE.Clock(),
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

    useEffect(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(THEME.bgDark);
        scene.fog = new THREE.FogExp2(THEME.bgDark, 0.0015);
        
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 5000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        mountRef.current.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xfff4e0, 0.05));
        const amberLight = new THREE.PointLight(0xffa500, 0.4, 1000);
        amberLight.position.set(200, 100, -100);
        scene.add(amberLight);

        const nebulaClouds = [];
        const nebulaGeo = new THREE.PlaneGeometry(1200, 900);
        for(let i = 0; i < 12; i++) {
            const mat = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(NebulaShader.uniforms),
                vertexShader: NebulaShader.vertexShader,
                fragmentShader: NebulaShader.fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            if (i % 3 === 0) mat.uniforms.uColor1.value.setHex(0xb45309); 
            else if (i % 3 === 1) mat.uniforms.uColor1.value.setHex(0x134e4a); 
            
            const cloud = new THREE.Mesh(nebulaGeo, mat);
            cloud.position.set((Math.random() - 0.5) * 1200, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 800 - 400);
            cloud.rotation.z = Math.random() * Math.PI;
            cloud.scale.setScalar(1 + Math.random() * 2.5);
            scene.add(cloud);
            nebulaClouds.push({ mesh: cloud, speed: (Math.random() - 0.5) * 0.03 });
        }

        const starGeo = new THREE.BufferGeometry();
        const starCount = 18000;
        const sPos = new Float32Array(starCount * 3);
        const sSize = new Float32Array(starCount);
        for(let i=0; i<starCount; i++) {
            const r = 1500 + Math.random() * 2500;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            sPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            sPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            sPos[i*3+2] = r * Math.cos(phi);
            sSize[i] = Math.random() * 2.0;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
        starGeo.setAttribute('size', new THREE.BufferAttribute(sSize, 1));
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, sizeAttenuation: true, size: 1.2, transparent: true, opacity: 0.5 });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        const nodes = GENERATED_NODES.map((data, i) => {
            const group = new THREE.Group();
            group.position.copy(data.pos);
            group.userData = { id: data.id, index: i };
            
            const hitArea = new THREE.Mesh(
                new THREE.SphereGeometry(18, 8, 8),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
            );
            hitArea.userData = { index: i };
            group.add(hitArea);

            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 2), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: data.color, emissiveIntensity: 1.2, roughness: 0.1, metalness: 0.9 }));
            group.add(core);
            const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 1), new THREE.MeshBasicMaterial({ color: data.color, wireframe: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending }));
            group.add(shell);
            const ring1 = new THREE.Mesh(new THREE.TorusGeometry(7, 0.08, 16, 64, Math.PI * 1.5), new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
            ring1.rotation.x = Math.PI / 2;
            group.add(ring1);
            const ring2 = new THREE.Mesh(new THREE.TorusGeometry(9, 0.03, 16, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 }));
            ring2.rotation.y = Math.PI / 3;
            group.add(ring2);
            const light = new THREE.PointLight(data.color, 15, 80);
            group.add(light);
            scene.add(group);
            return { group, core, shell, ring1, ring2, light, data, hitArea };
        });

        let rafId;
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            const delta = sceneState.current.clock.getDelta();
            const time = sceneState.current.clock.getElapsedTime();
            const st = sceneState.current;
            const { view: curView, activeIdx: curActiveIdx, isPlaying: curIsPlaying } = reactiveState.current;

            nebulaClouds.forEach((cloud, i) => {
                cloud.mesh.material.uniforms.uTime.value = time * 0.1 + i;
                cloud.mesh.rotation.z += cloud.speed * delta;
            });
            stars.rotation.y = time * 0.0005;

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
                if (st.playTimer > 8.0) { 
                    setActiveIdx(prev => (prev + 1) % NODE_COUNT);
                    st.playTimer = 0;
                }
            }

            const activeNode = nodes[curActiveIdx];
            st.zoom += (st.targetZoom - st.zoom) * 0.05;
            
            if (curView === 'overview') {
                const panX = st.panOffset.x * 0.15;
                const panY = st.panOffset.y * 0.15;
                const swayX = Math.sin(time * 0.2) * 20;
                const swayY = Math.cos(time * 0.15) * 12;
                st.targetCamPos.set(activeNode.data.pos.x + swayX + panX, activeNode.data.pos.y + 35 + swayY + panY, activeNode.data.pos.z + st.zoom);
                st.targetLookAt.copy(activeNode.data.pos);
            } else {
                st.targetCamPos.set(activeNode.data.pos.x - 12, activeNode.data.pos.y + 4, activeNode.data.pos.z + 15);
                st.targetLookAt.set(activeNode.data.pos.x + 3, activeNode.data.pos.y, activeNode.data.pos.z - 3);
            }
            
            camera.position.lerp(st.targetCamPos, curView === 'detail' ? 0.03 : 0.05);
            st.currentLookAt.lerp(st.targetLookAt, 0.05);
            camera.lookAt(st.currentLookAt);
            
            const targetRoll = -st.mouse.x * 0.03;
            camera.rotation.z += (targetRoll - camera.rotation.z) * 0.06;

            nodes.forEach((n, i) => {
                const isActive = curActiveIdx === i;
                const isHovered = st.hoveredIdx === i;
                const spd = n.data.speedMult * delta;
                n.core.scale.setScalar(1 + Math.sin(time * 1.5 + i) * 0.04);
                n.shell.rotation.y -= spd * 1.2;
                n.shell.material.opacity = isActive ? 0.8 : (isHovered ? 0.5 : 0.15);
                n.ring1.rotation.z += spd * 1.8;
                n.ring2.rotation.x += spd * 0.8;
                const targetScale = isActive ? 1.5 : (isHovered ? 1.2 : 1.0);
                n.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
                n.light.intensity = isActive ? 30 : (isHovered ? 15 : 5);
                n.group.position.y = n.data.pos.y + Math.sin(time + n.data.baseRotation.x * 8) * 4;
            });

            renderer.render(scene, camera);
        };
        animate();

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
            const st = sceneState.current;
            if (e.ctrlKey || e.metaKey || e.shiftKey) { e.preventDefault(); handleZoom(e.deltaY * 0.5); return; }
            if (reactiveState.current.view === 'overview') {
                st.scrollAcc += e.deltaY;
                if (Math.abs(st.scrollAcc) > 400) {
                    const dir = st.scrollAcc > 0 ? 1 : -1;
                    setActiveIdx(prev => (prev + dir + NODE_COUNT) % NODE_COUNT);
                    st.scrollAcc = 0;
                    setIsPlaying(false);
                }
            }
        };

        const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('dblclick', onDblClick);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('dblclick', onDblClick);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (mountRef.current) mountRef.current.innerHTML = '';
        };
    }, []);

    const activeNodeData = GENERATED_NODES[activeIdx];
    const activeColor = GENERATED_NODES[activeIdx].color.getStyle();

    return (
        <div 
            className={`fixed inset-0 bg-[#050402] overflow-hidden text-[#fef3c7] font-sans select-none ${isHovering ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div ref={mountRef} className="absolute inset-0 z-0" />

            {/* UI LAYER */}
            <div className="relative z-50 w-full h-full pointer-events-none flex flex-col justify-between p-6 md:p-10">
                
                {/* HUD Header */}
                <header className="flex justify-between items-start pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-2xl">
                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                        </div>
                        <div>
                            <h1 className="text-[10px] font-bold tracking-[0.5em] text-white/40 font-mono uppercase">
                                AEGIS_CMD
                            </h1>
                            <p className="text-[12px] text-white/80 font-semibold tracking-wide">
                                Sector 4: {activeNodeData.code}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className={`group h-10 px-5 flex items-center gap-3 text-[10px] font-bold tracking-widest border transition-all duration-500 backdrop-blur-3xl rounded-2xl ${isPlaying ? 'bg-amber-400/20 border-amber-400/30 text-amber-200' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-400' : 'bg-white/20'}`} />
                        {isPlaying ? 'SCANNING' : 'PAUSED'}
                    </button>
                </header>

                {/* CENTRAL CONTENT CONTAINER */}
                <div className="flex-1 relative mt-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {/* OVERVIEW CARD - MOVED TO BOTTOM RIGHT */}
                        {view === 'overview' && (
                            <motion.div 
                                key="overview" 
                                initial={{ opacity: 0, x: 50, y: 20 }} 
                                animate={{ opacity: 1, x: 0, y: 0 }} 
                                exit={{ opacity: 0, x: 50, y: 20 }} 
                                className="pointer-events-auto absolute bottom-4 right-4 w-full max-w-[320px]"
                            >
                                <div className="p-6 bg-white/[0.04] backdrop-blur-[40px] saturate-[180%] border border-white/20 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group/card">
                                    <div className="absolute -top-1/2 -right-1/2 w-full h-full blur-[100px] rounded-full opacity-10 pointer-events-none transition-colors duration-1000" style={{ backgroundColor: activeColor }} />
                                    
                                    <div className="relative z-10 flex flex-col items-start text-left">
                                        <div className="mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/40 tracking-[0.2em] uppercase">
                                            Inspector Active
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold tracking-tight text-white mb-1 leading-tight">
                                            {activeNodeData.name}
                                        </h3>
                                        <p className="text-[10px] text-white/30 mb-6 font-medium tracking-[0.1em] uppercase">{activeNodeData.class}</p>
                                        
                                        <button 
                                            onClick={() => setView('detail')}
                                            className="w-full py-4 bg-white text-black font-bold text-[13px] tracking-wide transition-all rounded-[1.2rem] shadow-xl hover:scale-[1.02] hover:bg-amber-50 active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            Detailed Analysis
                                        </button>
                                        <p className="mt-3 w-full text-center text-[9px] text-white/20 tracking-widest font-mono uppercase">
                                            Double-Click Object to Zoom
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* DETAIL CARD - CENTERED */}
                        {view === 'detail' && (
                            <motion.div 
                                key="detail"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="pointer-events-auto w-full max-w-lg"
                            >
                                <div className="mx-auto bg-white/[0.06] backdrop-blur-[50px] saturate-[200%] p-8 md:p-10 border border-white/20 rounded-[3rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    
                                    <div className="flex flex-col gap-8">
                                        <header className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">{activeNodeData.code}</div>
                                                <h2 className="text-4xl font-bold tracking-tight text-white">{activeNodeData.name}</h2>
                                            </div>
                                            <button 
                                                onClick={() => setView('overview')}
                                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-sm transition-all border border-white/10 active:scale-90"
                                            >
                                                ✕
                                            </button>
                                        </header>

                                        <p className="text-lg font-medium text-white/60 leading-relaxed italic">
                                            "{activeNodeData.desc}"
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 border border-white/10 p-5 rounded-[1.8rem] flex flex-col items-center justify-center">
                                                <div className="text-[9px] font-bold text-white/20 mb-1 uppercase tracking-widest">Temperature</div>
                                                <div className="text-xl font-bold text-white">{(Math.random() * 500 + 200).toFixed(0)} K</div>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 p-5 rounded-[1.8rem] flex flex-col items-center justify-center">
                                                <div className="text-[9px] font-bold text-white/20 mb-1 uppercase tracking-widest">Photon Flux</div>
                                                <div className="text-xl font-bold text-white">{(Math.random() * 1.5).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button className="w-full py-5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm tracking-wide border border-white/10 rounded-[1.8rem] transition-all active:scale-[0.98]">
                                                Initiate Quantum Scan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* HUD Footer */}
                <footer className="flex justify-center items-end pointer-events-auto pb-4">
                    <div className="bg-white/[0.04] backdrop-blur-3xl border border-white/10 rounded-full px-8 py-4 flex gap-6 shadow-2xl">
                        {GENERATED_NODES.map((_, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setActiveIdx(i); setIsPlaying(false); }}
                                className="relative group p-1"
                            >
                                <div 
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === activeIdx ? 'scale-[2.5]' : 'group-hover:scale-150 group-hover:bg-white/40'}`}
                                    style={{ 
                                        backgroundColor: i === activeIdx ? activeColor : 'rgba(255,255,255,0.1)',
                                        boxShadow: i === activeIdx ? `0 0 15px ${activeColor}` : 'none'
                                    }}
                                />
                                {i === activeIdx && (
                                    <motion.div layoutId="activeDot" className="absolute -inset-1 border border-white/20 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </footer>

            </div>
            <BackButton />
        </div>
    );
}