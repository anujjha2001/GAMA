'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Ring, Sparkles, Html, Line, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Eye, RotateCcw, Zap, Layers, Sparkles as SparklesIcon, Maximize2, ShieldAlert } from 'lucide-react';

interface InteractiveBodyTwin3DProps {
  organs: Record<string, OrganData>;
  selectedOrgan: OrganData | null;
  onSelectOrgan: (organ: OrganData | null) => void;
  systemFilter: string;
}

// Camera controller that lerps smoothly to focused organ
function CameraController({ targetPosition }: { targetPosition: [number, number, number] | null }) {
  const { camera, controls } = useThree();
  const targetVec = useRef(new THREE.Vector3(0, 0, 4.5));
  const lookAtVec = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (targetPosition) {
      targetVec.current.set(targetPosition[0], targetPosition[1], targetPosition[2] + 1.2);
      lookAtVec.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    } else {
      targetVec.current.set(0, 0, 4.2);
      lookAtVec.current.set(0, 0, 0);
    }
  }, [targetPosition]);

  useFrame((_, delta) => {
    camera.position.lerp(targetVec.current, delta * 3.5);
    if (controls) {
      // @ts-ignore
      controls.target.lerp(lookAtVec.current, delta * 3.5);
      // @ts-ignore
      controls.update();
    }
  });

  return null;
}

// 3D Skeleton & Body Wireframe Representation
// 3D Skeleton & Body Wireframe Representation using GLB Model
function Body3DSkeleton({ selectedOrganId, showXRay }: { selectedOrganId?: string; showXRay: boolean }) {
  const { scene } = useGLTF('/models/human.glb');
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle hovering breath motion
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.03;
  });

  // Traverse and apply holographic materials
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name === 'Beta_Surface') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#00f0ff',
            transparent: true,
            opacity: showXRay ? 0.08 : 0.03,
            wireframe: showXRay,
            emissive: '#00b8ff',
            emissiveIntensity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
        } else if (child.name === 'Beta_Joints') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            transparent: true,
            opacity: showXRay ? 0.35 : 0.2,
            wireframe: false,
            emissive: '#38bdf8',
            emissiveIntensity: 0.8,
            depthWrite: true,
          });
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: '#00f0ff',
            transparent: true,
            opacity: 0.1,
            wireframe: showXRay,
            emissive: '#00f0ff',
            emissiveIntensity: 0.3,
            depthWrite: false,
          });
        }
      }
    });
  }, [scene, showXRay]);

  return (
    <group ref={groupRef} position={[0, -1.35, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* GLTF Primitive */}
      <primitive object={scene} />

      {/* Spine Line (Tech aesthetic) */}
      <mesh position={[0, 1.25, -0.05]}>
        <cylinderGeometry args={[0.015, 0.015, 1.3, 8]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.2} />
      </mesh>

      {/* Rib Cage (Tech aesthetic) */}
      <group position={[0, 1.3, -0.02]}>
        {[-0.15, -0.08, 0, 0.08, 0.15].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.22 - Math.abs(y) * 0.3, 0.012, 8, 24]} />
            <meshStandardMaterial
              color={selectedOrganId === 'lungs' || selectedOrganId === 'heart' ? '#ff2a85' : '#00f0ff'}
              emissive={selectedOrganId === 'lungs' || selectedOrganId === 'heart' ? '#ff2a85' : '#00f0ff'}
              emissiveIntensity={selectedOrganId === 'lungs' || selectedOrganId === 'heart' ? 2.5 : 0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Hologram Pedestal */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.68, 64]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.85, 0.87, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Interactive Hotspot Node for each organ
function OrganHotspot3D({
  organ,
  isSelected,
  onClick,
}: {
  organ: OrganData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const pulse = Math.sin(time * 3 + organ.score) * 0.04;
      meshRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 1.5;
    }
  });

  const nodeColor = organ.color || (isSelected
    ? '#00f0ff'
    : organ.status === 'OPTIMAL'
      ? '#00f0ff'
      : organ.status === 'GOOD'
        ? '#34d399'
        : '#ff2a85');

  return (
    <group position={organ.position3D}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[isSelected ? 0.12 : 0.08, 24, 24]} />
        <meshStandardMaterial color={nodeColor} emissive={nodeColor} emissiveIntensity={isSelected ? 2.5 : 1.2} />
      </mesh>

      {/* Orbiting halo ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[isSelected ? 0.16 : 0.11, isSelected ? 0.18 : 0.12, 32]} />
        <meshBasicMaterial color={nodeColor} transparent opacity={isSelected ? 0.9 : 0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Html Label Overlay */}
      <Html distanceFactor={4} position={[0.18, 0.05, 0]} style={{ pointerEvents: 'none' }}>
        <div
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${isSelected
            ? 'bg-[#00f0ff] text-black border-white shadow-[0_0_15px_#00f0ff]'
            : 'bg-[#09090b]/80 text-white border-white/20 backdrop-blur-md'
            }`}
        >
          {organ.name} <span className="ml-1 font-bold text-[9px] opacity-80">{organ.score}%</span>
        </div>
      </Html>
    </group>
  );
}

export function InteractiveBodyTwin3D({
  organs,
  selectedOrgan,
  onSelectOrgan,
  systemFilter,
}: InteractiveBodyTwin3DProps) {
  const [showXRay, setShowXRay] = useState(true);
  const organList = Object.values(organs);

  const filteredOrgans = organList.filter((organ) => {
    if (systemFilter === 'all') return true;
    if (systemFilter === 'cardiovascular') return organ.id === 'heart' || organ.id === 'lungs';
    if (systemFilter === 'nervous') return organ.id === 'brain' || organ.id === 'spine';
    if (systemFilter === 'digestive') return organ.id === 'stomach' || organ.id === 'liver' || organ.id === 'kidneys';
    if (systemFilter === 'musculoskeletal') return organ.id === 'legs';
    return true;
  });

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-3xl overflow-hidden bg-[#031114] border border-white/5 flex flex-col justify-between p-4 shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
      {/* Glowing Canvas Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#083038]/45 via-[#031114]/95 to-[#031114] pointer-events-none z-0" />

      {/* Floating 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
          <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ff2a85" />
          <Sparkles count={150} scale={5} size={1.5} speed={0.15} color="#38bdf8" />

          <CameraController targetPosition={selectedOrgan ? selectedOrgan.position3D : null} />

          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <Body3DSkeleton selectedOrganId={selectedOrgan?.id} showXRay={showXRay} />

            {filteredOrgans.map((organ) => (
              <OrganHotspot3D
                key={organ.id}
                organ={organ}
                isSelected={selectedOrgan?.id === organ.id}
                onClick={() => onSelectOrgan(selectedOrgan?.id === organ.id ? null : organ)}
              />
            ))}
          </Float>

          <OrbitControls enableZoom={true} maxDistance={6} minDistance={1.8} enablePan={false} />
        </Canvas>
      </div>

      {/* Top Floating Controls Overlay */}
      <div className="relative z-20 flex justify-between items-center w-full gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#09090b]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15">
          <div className="px-3 py-1.5 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] flex items-center gap-2">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest"></span>
          </div>
          <button
            onClick={() => setShowXRay(!showXRay)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${showXRay ? 'bg-white/15 text-white border-white/30' : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            X-Ray Wireframe
          </button>
        </div>

        {selectedOrgan && (
          <button
            onClick={() => onSelectOrgan(null)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00f0ff]" />
            Reset Camera
          </button>
        )}
      </div>

      {/* Bottom Floating Organ Quick Selector */}
      <div className="relative z-20 flex items-center justify-center w-full pointer-events-auto">
        <div className="flex gap-2 overflow-x-auto p-2 bg-[#09090b]/85 backdrop-blur-2xl rounded-2xl border border-white/15 max-w-full no-scrollbar shadow-2xl">
          {organList.map((organ) => {
            const isSelected = selectedOrgan?.id === organ.id;
            return (
              <button
                key={organ.id}
                onClick={() => onSelectOrgan(isSelected ? null : organ)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${isSelected
                  ? 'bg-[#00f0ff] text-black border-white shadow-[0_0_15px_rgba(0,240,255,0.4)] font-black'
                  : 'bg-white/5 text-neutral-300 hover:text-white border-white/10 hover:bg-white/10'
                  }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${organ.status === 'OPTIMAL' ? 'bg-[#00f0ff]' : organ.status === 'GOOD' ? 'bg-[#34d399]' : 'bg-[#ff2a85]'
                    }`}
                />
                {organ.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

useGLTF.preload('/models/human.glb');
