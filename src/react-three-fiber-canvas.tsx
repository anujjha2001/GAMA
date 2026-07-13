'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function DnaHelix() {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.25;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.15;
  });

  const count = 28;
  const radius = 1.0;

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 4; // 2 full turns
        const y = (i / count) * 3.2 - 1.6; // from -1.6 to 1.6
        
        // Strand 1
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        
        // Strand 2 (180 deg out of phase)
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        return (
          <group key={i}>
            {/* Sphere 1 */}
            <mesh position={[x1, y, z1]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            
            {/* Sphere 2 */}
            <mesh position={[x2, y, z2]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#ec4899" />
            </mesh>

            {/* Connecting rung */}
            <mesh 
              position={[(x1 + x2) / 2, y, (z1 + z2) / 2]} 
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[radius * 2, 0.015, 0.015]} />
              <meshBasicMaterial color="#475569" transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function CanvasWrapper() {
  return (
    <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} className="w-full h-full">
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2.0} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={1.0} color="#ec4899" />
      <DnaHelix />
    </Canvas>
  );
}
