'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface BodyHologramProps {
  activeSystem: string;
  stressLevel: number;
  heartRate: number;
  hrv: number;
  showPedestal?: boolean;
  onOrganClick?: (organ: string) => void;
}

// A component that displays the generated AI image as a glowing sprite
function HologramSprite({ activeSystem, stressLevel, heartRate, onOrganClick }: { activeSystem: string, stressLevel: number, heartRate: number, onOrganClick?: (organ: string) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<THREE.Mesh>(null);
  
  // Load the AI-generated texture
  const texture = useTexture('/hologram.png');

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow cinematic hover
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.05; // Hover without dropping down
    
    // Breathing animation on scale
    const breathRate = 1.0 + (stressLevel / 10);
    const breath = Math.sin(time * breathRate) * 0.015;
    groupRef.current.scale.set(1 + breath, 1 + breath * 0.5, 1);

    if (activeSystem === 'cardiovascular') {
      const beatRate = (heartRate / 60) * Math.PI * 2;
      const beat = Math.pow(Math.sin(time * beatRate), 8) * 0.02;
      groupRef.current.scale.addScalar(beat);
    }
  });

  // Calculate dynamic color tint based on the active system
  let tintColor = '#ffffff'; // Default base (texture colors are preserved)
  if (activeSystem === 'nervous') tintColor = '#c084fc';
  if (activeSystem === 'cardiovascular') tintColor = '#fb7185';
  if (activeSystem === 'metabolic') tintColor = '#34d399';
  if (activeSystem === 'musculoskeletal') tintColor = '#fbbf24';

  return (
    <group ref={groupRef}>
      <mesh ref={spriteRef}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial 
          map={texture} 
          transparent={true} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          color={tintColor}
        />
      </mesh>

      {/* Interactive Organ Hotspots */}
      <group position={[0, 0, 0.1]}>
        {/* Brain */}
        <mesh 
          position={[0, 1.25, 0]} 
          onClick={(e) => { e.stopPropagation(); onOrganClick?.('nervous'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
          visible={false}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Lungs */}
        <mesh 
          position={[0, 0.7, 0]} 
          onClick={(e) => { e.stopPropagation(); onOrganClick?.('respiratory'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
          visible={false}
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Heart */}
        <mesh 
          position={[0.1, 0.6, 0.05]} 
          onClick={(e) => { e.stopPropagation(); onOrganClick?.('cardiovascular'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
          visible={false}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Gut / Metabolic */}
        <mesh 
          position={[0, 0.2, 0]} 
          onClick={(e) => { e.stopPropagation(); onOrganClick?.('metabolic'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
          visible={false}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Musculoskeletal (Legs area hotspot) */}
        <mesh 
          position={[0, -0.6, 0]} 
          onClick={(e) => { e.stopPropagation(); onOrganClick?.('musculoskeletal'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
          visible={false}
        >
          <boxGeometry args={[0.6, 1.2, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </group>
  );
}

export function BodyHologram({ activeSystem, stressLevel, heartRate, hrv, showPedestal = false, onOrganClick }: BodyHologramProps) {
  return (
    <group position={[0, 0.15, 0]} scale={1.25}>
      
      {/* The AI Generated 2D Hologram */}
      <React.Suspense fallback={null}>
        <HologramSprite activeSystem={activeSystem} stressLevel={stressLevel} heartRate={heartRate} onOrganClick={onOrganClick} />
      </React.Suspense>

      {/* Sci-Fi Pedestal */}
      {showPedestal && (
        <group position={[0, -1.45, 0]}>
          {/* Outer glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.55, 64]} />
            <meshBasicMaterial color="#0a84ff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Inner glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.2, 1.22, 64]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Dashed ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <ringGeometry args={[1.0, 1.05, 32, 1, 0, Math.PI * 2]} />
            <meshBasicMaterial color="#80c0ff" transparent opacity={0.4} side={THREE.DoubleSide} wireframe />
          </mesh>
          {/* Ground glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <circleGeometry args={[1.6, 64]} />
            <meshBasicMaterial color="#0a84ff" transparent opacity={0.05} />
          </mesh>
        </group>
      )}
    </group>
  );
}
