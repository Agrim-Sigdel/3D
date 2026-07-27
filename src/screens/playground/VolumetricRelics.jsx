import React, { useEffect, useRef, useState } from 'react';
import BackButton from '../BackButton';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CONFIGURATION & THEME
 */
const NODE_COUNT = 12;
const THEME = {
    bgDark: '#010005',
    nebulaPrimary: '#0033ff', // Deep Blue
    nebulaSecondary: '#ff0099', // Neon Magenta
    accent: '#00f3ff', // Cyan
    textMain: '#e0f7fa',
    textMuted: '#4fc3f7'
};

const DATA_POOL = [
    { name: "VOID_KNOT", code: "VK-Alpha", class: "Class V Anomaly", desc: "A localized fold in spacetime. High concentrations of exotic matter detected in the accretion halo." },
    { name: "CHRONO_FRACTURE", code: "CF-Beta", class: "Temporal Rift", desc: "Time dilation extreme. Probes sent into the core experience negative chronal flow. Do not approach." },
    { name: "AETHER_PULSAR", code: "AP-Gamma", class: "Energy Source", desc: "Emitting immense bursts of raw Aether energy. Potential candidate for Dyson-scale harvesting." },
    { name: "NULL_SPHERE", code: "NS-Delta", class: "Gravitational Void", desc: "An area devoid of all physical laws. Light bends around it, creating a perfect localized eclipse." },
    { name: "ECHO_NEXUS", code: "EN-Epsilon", class: "Data Remnant", desc: "Swirling patterns of light suspected to be the decayed databanks of a precursor civilization." },
    { name: "PLASMA_WEAVER", code: "PW-Zeta", class: "Stellar Nursery", desc: "Superheated gas threads weaving new protostars at an accelerated, unnatural rate." },
    { name: "DARK_MIRROR", code: "DM-Eta", class: "Spatial Reflection", desc: "A flat anomaly that perfectly reflects sensor pings, but shows a slightly different configuration of the cosmos." },
    { name: "QUANTUM_FOAM", code: "QF-Theta", class: "Subatomic Scale", desc: "Macroscopic manifestation of quantum uncertainty. The structure physically changes when observed." },
];

const GENERATED_NODES = Array.from({ length: NODE_COUNT }).map((_, i) => {
    const data = DATA_POOL[i % DATA_POOL.length];
    // Alternate colors between Cyan, Magenta, and Deep Blue
    const hue = i % 3 === 0 ? 0.5 : (i % 3 === 1 ? 0.85 : 0.65);
    return {
        id: `node-${i}`,
        ...data,
        color: new THREE.Color().setHSL(hue, 1, 0.6),
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 250,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 100
        ),
        baseRotation: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
        speedMult: 0.5 + Math.random() * 0.8,
        // Rolled once per node. Generating this in the detail panel would
        // reshuffle the readout on every re-render.
        massIndex: (Math.random() * 900 + 100).toFixed(2)
    };
});

// Decorative telemetry: stable for the session rather than per-render.
const MEM_ALLOC = Math.floor(Math.random() * 40 + 60);

// Adjusted Volumetric Nebula Shader
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

        // Simplex Noise (Ashima Arts)
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
            // Swirling effect
            float angle = snoise(uv * 2.0 + uTime * 0.05) * 3.14;
            float radius = length(uv - 0.5);
            uv.x += cos(angle) * radius * 0.1;
            uv.y += sin(angle) * radius * 0.1;

            float noise = snoise(uv * 2.5 + uTime * 0.1);
            noise += 0.5 * snoise(uv * 5.0 - uTime * 0.08);
            
            float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
            edgeFade *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            
            vec3 color = mix(uColor2, uColor1, noise * 0.5 + 0.5);
            // Add starlight bright spots
            float stars = pow(max(0.0, snoise(uv * 20.0 + uTime * 0.2)), 8.0) * 2.0;
            
            gl_FragColor = vec4(color + vec3(stars), (noise * 0.5 + 0.2) * uOpacity * edgeFade);
        }
    `
};

export default function App() {
    const mountRef = useRef(null);
    const [view, setView] = useState('overview'); 
    const [activeIdx, setActiveIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // One DOM node per relic, positioned imperatively from the render loop.
    const labelRefs = useRef([]);
    
    // Sync state for Three.js render loop without triggering re-renders
    const reactiveState = useRef({ view, activeIdx, isPlaying });
    useEffect(() => {
        reactiveState.current = { view, activeIdx, isPlaying };
    }, [view, activeIdx, isPlaying]);

    const sceneState = useRef({
        mouse: new THREE.Vector2(),
        clock: new THREE.Clock(),
        raycaster: new THREE.Raycaster(),
        hoveredId: null,
        targetZoom: 120,
        zoom: 120,
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
        sceneState.current.targetZoom = Math.min(Math.max(sceneState.current.targetZoom + delta, 40), 400);
    };

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(THEME.bgDark);
        scene.fog = new THREE.FogExp2(THEME.bgDark, 0.0025);
        
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 5000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // Add subtle tone mapping for better glow handling
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        mount.appendChild(renderer.domElement);

        // --- LIGHTING ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.1));
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.5);
        mainLight.position.set(100, 200, 50);
        scene.add(mainLight);

        // --- ENVIRONMENT: NEBULA CLOUDS ---
        const nebulaClouds = [];
        const nebulaGeo = new THREE.PlaneGeometry(800, 600);
        for(let i = 0; i < 8; i++) {
            const mat = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(NebulaShader.uniforms),
                vertexShader: NebulaShader.vertexShader,
                fragmentShader: NebulaShader.fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            // Vary colors slightly per cloud
            if (i % 2 === 0) mat.uniforms.uColor1.value.setHex(0x00ffff);
            
            const cloud = new THREE.Mesh(nebulaGeo, mat);
            cloud.position.set(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 600 - 300
            );
            cloud.rotation.z = Math.random() * Math.PI;
            cloud.scale.setScalar(1 + Math.random() * 2);
            scene.add(cloud);
            nebulaClouds.push({ mesh: cloud, speed: (Math.random() - 0.5) * 0.05 });
        }

        // --- ENVIRONMENT: ENERGY CURRENT (Flowing Particles) ---
        const currentGeo = new THREE.BufferGeometry();
        const currentCount = 8000;
        const cPos = new Float32Array(currentCount * 3);
        const cPhases = new Float32Array(currentCount); // For sine wave animation
        for(let i=0; i<currentCount; i++) {
            cPos[i*3] = (Math.random()-0.5)*1500;
            cPos[i*3+1] = (Math.random()-0.5)*400;
            cPos[i*3+2] = (Math.random()-0.5)*1000;
            cPhases[i] = Math.random() * Math.PI * 2;
        }
        currentGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
        currentGeo.setAttribute('phase', new THREE.BufferAttribute(cPhases, 1));
        
        // Custom shader material for particles to pulse and flow
        const currentMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(THEME.accent) }
            },
            vertexShader: `
                uniform float uTime;
                attribute float phase;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    // Flow motion
                    pos.x += sin(uTime * 0.5 + phase) * 20.0;
                    pos.y += cos(uTime * 0.3 + pos.x * 0.01) * 15.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (40.0 / -mvPosition.z) * (sin(uTime * 2.0 + phase) * 0.5 + 0.5 + 0.5);
                    gl_Position = projectionMatrix * mvPosition;
                    vAlpha = (sin(uTime + phase) * 0.5 + 0.5) * 0.6;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;
                void main() {
                    // Soft circle particle
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    float strength = (0.5 - dist) * 2.0;
                    gl_FragColor = vec4(uColor, vAlpha * strength);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const energyCurrent = new THREE.Points(currentGeo, currentMat);
        scene.add(energyCurrent);


        // --- BUILD: ASTRAL RELICS (The Interactive Nodes) ---
        // Reusable Geometries to save memory
        const coreGeo = new THREE.IcosahedronGeometry(2.5, 2); // Smoother core
        const shellGeo = new THREE.IcosahedronGeometry(4, 1); // Wireframe shell
        const ringGeo1 = new THREE.TorusGeometry(7, 0.08, 16, 64, Math.PI * 1.5); // Broken ring
        const ringGeo2 = new THREE.TorusGeometry(9, 0.03, 16, 64); // Outer thin ring

        const nodes = GENERATED_NODES.map((data, i) => {
            const group = new THREE.Group();
            group.position.copy(data.pos);
            group.userData = { id: data.id, index: i };

            // 1. Dark Matter Core (Absorbs light, emits color at edges)
            const coreMat = new THREE.MeshStandardMaterial({ 
                color: 0x000000, 
                emissive: data.color, 
                emissiveIntensity: 0.8,
                roughness: 0.2,
                metalness: 0.8
            });
            const core = new THREE.Mesh(coreGeo, coreMat);
            group.add(core);

            // 2. Containment Shell (Wireframe)
            const shellMat = new THREE.MeshBasicMaterial({
                color: data.color,
                wireframe: true,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const shell = new THREE.Mesh(shellGeo, shellMat);
            group.add(shell);

            // 3. Inner Broken Ring
            const ring1Mat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
            const ring1 = new THREE.Mesh(ringGeo1, ring1Mat);
            ring1.rotation.x = Math.PI / 2;
            group.add(ring1);

            // 4. Outer Fine Ring
            const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
            const ring2 = new THREE.Mesh(ringGeo2, ring2Mat);
            ring2.rotation.y = Math.PI / 3;
            group.add(ring2);

            // 5. Local Light Source
            const light = new THREE.PointLight(data.color, 15, 60);
            group.add(light);

            scene.add(group);
            return { group, core, shell, ring1, ring2, light, data };
        });

        // --- RENDER LOOP ---
        let rafId;
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            const delta = sceneState.current.clock.getDelta();
            const time = sceneState.current.clock.getElapsedTime();
            const st = sceneState.current;
            const { view: curView, activeIdx: curActiveIdx, isPlaying: curIsPlaying } = reactiveState.current;

            // Update Environment
            nebulaClouds.forEach((cloud, i) => {
                cloud.mesh.material.uniforms.uTime.value = time * 0.15 + i;
                cloud.mesh.rotation.z += cloud.speed * delta;
            });
            energyCurrent.material.uniforms.uTime.value = time;
            energyCurrent.rotation.y = time * 0.02;

            // Autoplay Sequence
            if (curIsPlaying && curView === 'overview') {
                st.playTimer += delta;
                if (st.playTimer > 6.0) { // Slower transition for cinematic feel
                    setActiveIdx(prev => (prev + 1) % NODE_COUNT);
                    st.playTimer = 0;
                }
            }

            // Raycaster Interaction
            st.raycaster.setFromCamera(st.mouse, camera);
            const intersects = st.raycaster.intersectObjects(nodes.map(n => n.group), true);
            let hovered = null;
            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while(obj.parent && obj.userData.index === undefined) obj = obj.parent;
                if(obj.userData.index !== undefined) hovered = obj.userData.id;
            }
            st.hoveredId = hovered;

            // Camera Dynamics Setup
            const activeNode = nodes[curActiveIdx];
            st.zoom += (st.targetZoom - st.zoom) * 0.05;
            
            if (curView === 'overview') {
                // Overview: Float near the active node, looking at it
                const panX = st.panOffset.x * 0.1;
                const panY = st.panOffset.y * 0.1;
                // Add gentle orbital sway
                const swayX = Math.sin(time * 0.3) * 15;
                const swayY = Math.cos(time * 0.25) * 8;

                st.targetCamPos.set(
                    activeNode.data.pos.x + swayX + panX,
                    activeNode.data.pos.y + 30 + swayY + panY,
                    activeNode.data.pos.z + st.zoom
                );
                st.targetLookAt.copy(activeNode.data.pos);
            } else {
                // Detail: Fly close, slightly offset to the left, looking across the node
                // Positioned almost "inside" the outer rings
                st.targetCamPos.set(
                    activeNode.data.pos.x - 18, 
                    activeNode.data.pos.y + 4,
                    activeNode.data.pos.z + 18
                );
                st.targetLookAt.set(
                    activeNode.data.pos.x + 10, 
                    activeNode.data.pos.y, 
                    activeNode.data.pos.z - 5
                );
            }
            
            // Apply Camera Easing
            camera.position.lerp(st.targetCamPos, curView === 'detail' ? 0.03 : 0.05);
            st.currentLookAt.lerp(st.targetLookAt, 0.05);
            camera.lookAt(st.currentLookAt);
            
            // Add subtle camera roll based on mouse X for zero-g feel
            const targetRoll = -st.mouse.x * 0.05;
            camera.rotation.z += (targetRoll - camera.rotation.z) * 0.1;

            // Animate Individual Nodes (Relics)
            nodes.forEach((n, i) => {
                const isHovered = st.hoveredId === n.data.id;
                const isActive = curActiveIdx === i;
                const spd = n.data.speedMult * delta;

                // Core Breathing
                const coreScale = 1 + Math.sin(time * 2 + i) * 0.05;
                n.core.scale.setScalar(coreScale);
                
                // Shell rotates opposite to core
                n.shell.rotation.y -= spd * 1.5;
                n.shell.rotation.x -= spd * 0.5;
                n.shell.material.opacity = isActive ? 0.8 : (isHovered ? 0.5 : 0.2);

                // Rings complex rotation
                n.ring1.rotation.z += spd * 2;
                n.ring2.rotation.x += spd;
                n.ring2.rotation.y += spd * 1.2;

                // State based scale & light
                const targetScale = isActive ? 1.5 : (isHovered ? 1.2 : 1.0);
                n.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
                n.light.intensity = isActive ? 30 : (isHovered ? 15 : 5);
                
                // Gentle vertical bobbing
                n.group.position.y = n.data.pos.y + Math.sin(time + n.data.baseRotation.x * 10) * 3;
            });

            // Project 3D positions to 2D screen space for UI overlays. Written
            // straight to the DOM rather than through React state, which would
            // re-render the whole tree once per frame; the label contents still
            // come from React and only change when activeIdx does.
            const projected = new THREE.Vector3();
            nodes.forEach((n, i) => {
                const el = labelRefs.current[i];
                if (!el) return;

                projected.copy(n.data.pos).project(camera);
                // Hide if behind camera or in detail view
                if (projected.z >= 1 || curView !== 'overview') {
                    el.style.visibility = 'hidden';
                    return;
                }

                const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(projected.y * 0.5) + 0.5) * window.innerHeight;
                el.style.visibility = 'visible';
                el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
            });

            renderer.render(scene, camera);
        };
        animate();

        // --- EVENT LISTENERS ---
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
            if (reactiveState.current.view === 'overview') {
                sceneState.current.isDragging = true;
                sceneState.current.lastMousePos.set(e.clientX, e.clientY);
            }
        };

        const onMouseUp = () => { sceneState.current.isDragging = false; };

        const onWheel = (e) => {
            const st = sceneState.current;
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                e.preventDefault();
                handleZoom(e.deltaY * 0.5);
                return;
            }
            if (reactiveState.current.view === 'overview') {
                st.scrollAcc += e.deltaY;
                if (Math.abs(st.scrollAcc) > 600) {
                    const dir = st.scrollAcc > 0 ? 1 : -1;
                    setActiveIdx(prev => (prev + dir + NODE_COUNT) % NODE_COUNT);
                    st.scrollAcc = 0;
                    setIsPlaying(false); // Stop auto if user interacts
                }
            }
        };

        const onClick = () => {
            const st = sceneState.current;
            const hoveredNode = nodes.find(n => n.data.id === st.hoveredId);
            if (hoveredNode) {
                // BUG FIX: Retrieve index from the three.js group userData, not the data object directly.
                const idx = hoveredNode.group.userData.index; 
                if (idx === reactiveState.current.activeIdx) {
                    // Toggle view if clicking the already active node
                    setView(v => v === 'overview' ? 'detail' : 'overview');
                } else {
                    setActiveIdx(idx);
                    setIsPlaying(false);
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
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose());
                }
            });
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    // BUG FIX: Derived the active node directly from GENERATED_NODES, ensuring 
    // it perfectly matches the 12 generated 3D elements, rather than the 8 base items.
    const activeNodeData = GENERATED_NODES[activeIdx];
    const activeColor = GENERATED_NODES[activeIdx].color.getStyle();

    return (
        <div className="fixed inset-0 bg-[#010005] overflow-hidden text-[#e0f7fa] font-sans select-none selection:bg-cyan-500/30">
            <BackButton />
            {/* Base gradient for when 3D is loading/transparent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#001133] via-[#010005] to-black opacity-80" />

            {/* Canvas Container */}
            <div ref={mountRef} className="absolute inset-0 z-0" />

            {/* CSS Scanning Line Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] mix-blend-overlay opacity-30" />

            {/* UI Layer */}
            <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-8 md:p-12">
                
                {/* --- TOP HUD --- */}
                <header className="flex justify-between items-start pointer-events-auto">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded border border-cyan-500/50 flex items-center justify-center bg-cyan-500/10">
                                <div className="w-3 h-3 bg-cyan-400 rounded-sm animate-pulse" />
                            </div>
                            <h1 className="text-sm font-bold tracking-[0.4em] text-cyan-400 font-mono uppercase">
                                AEGIS_ORBITAL_CMD
                            </h1>
                        </div>
                        <p className="text-[10px] text-cyan-200/50 font-mono tracking-widest pl-11">
                            SECTOR 4 // QUANTUM_ANOMALY_FIELD
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        {view === 'overview' && (
                            <div className="flex flex-col gap-2 items-end">
                                <button 
                                    onClick={() => setIsPlaying(!isPlaying)} 
                                    className={`px-4 py-2 text-[10px] font-mono tracking-widest border transition-all duration-300 backdrop-blur-md ${isPlaying ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/5'}`}
                                >
                                    {isPlaying ? '[ AUTOPILOT: ON ]' : '[ AUTOPILOT: OFF ]'}
                                </button>
                                <div className="flex gap-1 border border-white/10 p-1 bg-black/40 backdrop-blur-md rounded">
                                    <button onClick={() => handleZoom(-40)} className="w-8 h-6 flex items-center justify-center hover:bg-cyan-500/30 text-cyan-400 transition-colors rounded-sm">+</button>
                                    <button onClick={() => handleZoom(40)} className="w-8 h-6 flex items-center justify-center hover:bg-cyan-500/30 text-cyan-400 transition-colors rounded-sm">−</button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        {view === 'overview' ? (
                            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                                {/* Projected Node Labels */}
                                {GENERATED_NODES.map((nodeData, i) => {
                                    const isActive = i === activeIdx;

                                    return (
                                        <div
                                            key={nodeData.id}
                                            ref={el => { labelRefs.current[i] = el; }}
                                            className={`absolute top-0 left-0 will-change-transform transition-opacity duration-500 pointer-events-none ${isActive ? 'opacity-100 z-20' : 'opacity-40 z-10'}`}
                                            style={{ visibility: 'hidden' }}
                                        >
                                            {isActive ? (
                                                <div className="flex items-center gap-4">
                                                    {/* Reticle */}
                                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                                        <div className="absolute inset-0 border border-cyan-400/50 rounded-full animate-[spin_4s_linear_infinite]" />
                                                        <div className="absolute inset-2 border-t border-b border-white/30 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                                                        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                                                    </div>
                                                    {/* Info Box */}
                                                    <div className="bg-gradient-to-r from-black/80 to-transparent p-4 border-l-2 border-cyan-400 backdrop-blur-sm">
                                                        <div className="text-[10px] font-mono text-cyan-400 mb-1 tracking-widest">{nodeData.code}</div>
                                                        <div className="text-xl font-bold tracking-wider whitespace-nowrap">{nodeData.name}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-3 h-3 bg-white/20 rounded-full border border-white/10" />
                                            )}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="detail"
                                initial={{ opacity: 0, filter: 'blur(10px)', x: -50 }}
                                animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                                exit={{ opacity: 0, filter: 'blur(10px)', x: -50 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0 flex items-center justify-start pointer-events-none"
                            >
                                <div className="max-w-xl w-full flex flex-col pointer-events-auto bg-black/40 p-8 md:p-12 border border-white/5 backdrop-blur-xl rounded-r-3xl shadow-2xl relative overflow-hidden">
                                    
                                    {/* Glassmorphism subtle glow */}
                                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: activeColor, boxShadow: `0 0 30px ${activeColor}` }} />
                                    
                                    <button 
                                        onClick={() => setView('overview')}
                                        className="self-start mb-8 text-[10px] font-mono tracking-widest text-white/50 hover:text-cyan-400 flex items-center gap-2 transition-colors group"
                                    >
                                        <span className="group-hover:-translate-x-1 transition-transform">←</span> ABORT_APPROACH
                                    </button>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="inline-block px-2 py-1 bg-white/10 border border-white/10 rounded text-[9px] font-mono tracking-widest mb-4">
                                                {activeNodeData.code} // {activeNodeData.class}
                                            </div>
                                            <h2 className="text-5xl md:text-6xl font-bold tracking-tight uppercase" style={{ textShadow: `0 0 20px ${activeColor}40` }}>
                                                {activeNodeData.name}
                                            </h2>
                                        </div>

                                        <p className="text-sm md:text-base font-light text-white/70 leading-relaxed border-t border-white/10 pt-6">
                                            {activeNodeData.desc}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="bg-black/50 border border-white/5 p-4 rounded">
                                                <div className="text-[9px] font-mono text-white/40 mb-2">MASS_INDEX</div>
                                                <div className="text-xl font-mono text-cyan-300">{activeNodeData.massIndex} YT</div>
                                            </div>
                                            <div className="bg-black/50 border border-white/5 p-4 rounded">
                                                <div className="text-[9px] font-mono text-white/40 mb-2">RAD_SIGNATURE</div>
                                                <div className="text-xl font-mono text-pink-400">CLASS {['X','Y','Z'][activeIdx%3]}</div>
                                            </div>
                                        </div>

                                        <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 transition-all font-mono text-xs tracking-[0.3em] relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                            <span className="relative z-10">INITIATE_DEEP_SCAN</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- BOTTOM HUD --- */}
                <footer className="flex justify-between items-end pointer-events-auto">
                    {/* Pagination / Navigation */}
                    {view === 'overview' && (
                        <div className="flex flex-col gap-3 w-1/3">
                            <div className="text-[9px] font-mono text-white/30 tracking-widest flex justify-between">
                                <span>SCROLL OR DRAG TO NAVIGATE</span>
                                <span>{String(activeIdx + 1).padStart(2, '0')} / {NODE_COUNT}</span>
                            </div>
                            <div className="flex gap-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                {GENERATED_NODES.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="h-full transition-all duration-300 flex-1"
                                        style={{ 
                                            backgroundColor: i === activeIdx ? activeColor : 'transparent',
                                            opacity: i === activeIdx ? 1 : 0.2
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Decorative Data Stream */}
                    <div className="hidden md:flex flex-col items-end gap-1 ml-auto text-[8px] font-mono text-cyan-500/30 text-right opacity-50">
                        <div>SYS.CORE.OP // NOMINAL</div>
                        <div>MEM.ALLOC // {MEM_ALLOC}%</div>
                        <div>UPLINK // SECURE_CHANNEL_8</div>
                    </div>
                </footer>

            </div>
        </div>
    );
}
