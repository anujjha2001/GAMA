'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BodyHologramProps {
  activeSystem: string;
  stressLevel: number;
  heartRate: number;
  hrv: number;
  showPedestal?: boolean;
}

export function BodyHologram({ activeSystem, stressLevel, heartRate, hrv, showPedestal = false }: BodyHologramProps) {
  const groupRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow cinematic rotation
    groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.2;
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.05; // Hover
    
    // Breathing animation on chest
    if (chestRef.current) {
      const breathRate = 1.0 + (stressLevel / 10);
      const breath = Math.sin(time * breathRate) * 0.03;
      chestRef.current.scale.set(1 + breath, 1 + breath * 0.5, 1 + breath * 1.5);
    }
  });

  // Base holographic material
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: '#0ea5e9',
    emissive: '#0369a1',
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
    transmission: 0.9,
    thickness: 0.5,
    transparent: true,
    opacity: 0.8,
    wireframe: false,
    clearcoat: 1,
  });

  // Inner core material (simulates glowing organs/energy)
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: activeSystem === 'nervous' ? '#a855f7' : 
           activeSystem === 'cardiovascular' ? '#f43f5e' : 
           activeSystem === 'respiratory' ? '#06b6d4' : 
           activeSystem === 'metabolic' ? '#10b981' : '#f59e0b',
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  return (
    <group position={[0, -0.5, 0]}>
      <group ref={groupRef} position={[0, 0, 0]}>
        
        {/* Head */}
        <mesh position={[0, 2.8, 0]} material={bodyMaterial}>
          <sphereGeometry args={[0.3, 32, 32]} />
          {activeSystem === 'nervous' && (
            <mesh scale={0.8} material={coreMaterial}>
              <sphereGeometry args={[0.3, 16, 16]} />
            </mesh>
          )}
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 2.4, 0]} material={bodyMaterial}>
          <cylinderGeometry args={[0.1, 0.15, 0.3, 16]} />
        </mesh>

        {/* Torso (Chest + Abdomen) */}
        <mesh ref={chestRef} position={[0, 1.5, 0]} material={bodyMaterial}>
          <capsuleGeometry args={[0.45, 0.8, 16, 32]} />
          {/* Inner Core / Heart / Lungs */}
          {(activeSystem === 'cardiovascular' || activeSystem === 'respiratory' || activeSystem === 'metabolic') && (
            <mesh scale={0.7} position={[0, activeSystem === 'metabolic' ? -0.2 : 0.2, 0.1]} material={coreMaterial}>
              <sphereGeometry args={[0.4, 16, 16]} />
            </mesh>
          )}
        </mesh>

        {/* Shoulders & Arms */}
        {/* Left Arm */}
        <group position={[-0.6, 2.0, 0]} rotation={[0, 0, -0.2]}>
          <mesh position={[0, -0.4, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.12, 0.6, 16, 16]} />
          </mesh>
          <mesh position={[0, -1.2, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.1, 0.6, 16, 16]} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.6, 2.0, 0]} rotation={[0, 0, 0.2]}>
          <mesh position={[0, -0.4, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.12, 0.6, 16, 16]} />
          </mesh>
          <mesh position={[0, -1.2, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.1, 0.6, 16, 16]} />
          </mesh>
        </group>

        {/* Pelvis */}
        <mesh position={[0, 0.6, 0]} material={bodyMaterial}>
          <capsuleGeometry args={[0.4, 0.2, 16, 32]} />
        </mesh>

        {/* Legs */}
        {/* Left Leg */}
        <group position={[-0.25, 0.4, 0]} rotation={[0, 0, -0.05]}>
          <mesh position={[0, -0.6, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.18, 0.8, 16, 16]} />
          </mesh>
          <mesh position={[0, -1.7, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.14, 0.9, 16, 16]} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group position={[0.25, 0.4, 0]} rotation={[0, 0, 0.05]}>
          <mesh position={[0, -0.6, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.18, 0.8, 16, 16]} />
          </mesh>
          <mesh position={[0, -1.7, 0]} material={bodyMaterial}>
            <capsuleGeometry args={[0.14, 0.9, 16, 16]} />
          </mesh>
        </group>

      </group>

      {/* Sci-Fi Pedestal */}
      {showPedestal && (
        <group position={[0, -1.5, 0]}>
          {/* Outer glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.55, 64]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Inner glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.2, 1.22, 64]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Dashed ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <ringGeometry args={[1.0, 1.05, 32, 1, 0, Math.PI * 2]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.4} side={THREE.DoubleSide} wireframe />
          </mesh>
          {/* Ground glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <circleGeometry args={[1.6, 64]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
          </mesh>
        </group>
      )}
    </group>
  );
}

      {/* Sci-Fi Pedestal */}
      {showPedestal && (
        <group position={[0, -2, 0]}>
          {/* Outer glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.55, 64]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Inner glowing ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.2, 1.22, 64]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Dashed ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <ringGeometry args={[1.0, 1.05, 32, 1, 0, Math.PI * 2]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.4} side={THREE.DoubleSide} wireframe />
          </mesh>
          {/* Ground glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <circleGeometry args={[1.6, 64]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
          </mesh>
        </group>
      )}
    </group>
  );
}
