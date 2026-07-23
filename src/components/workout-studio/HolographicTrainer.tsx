// GAMA Workout Studio - Holographic Trainer Component

'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CoachingStyle } from '../../lib/workout-studio/WorkoutCoachEngine';

interface ModelProps {
  url: string;
  intensity: CoachingStyle;
}

function TrainerModel({ url, intensity }: ModelProps) {
  const group = React.useRef<THREE.Group>(null);
  
  // Safe load of local human model
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  React.useEffect(() => {
    // Attempt to play first animation if available
    const keys = Object.keys(actions);
    if (keys.length > 0 && actions[keys[0]]) {
      actions[keys[0]]!.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // Apply transparent glass holographic material
  React.useMemo(() => {
    scene.traverse((node) => {
      if ((node as any).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          emissive: '#002b36', // Teal blue edge emission
          roughness: 0.1,
          metalness: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          transmission: 0.85, // Highly translucent
          thickness: 1.5,
          ior: 1.5,
          side: THREE.DoubleSide
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.getElapsedTime();

    // Idle breathing: slight scale pulse
    const breatheFactor = Math.sin(time * 1.5) * 0.015;
    group.current.scale.set(1 + breatheFactor, 1 + breatheFactor, 1 + breatheFactor);

    // Subtle natural rotation/sway
    group.current.rotation.y = Math.sin(time * 0.5) * 0.05;
  });

  return <primitive ref={group} object={scene} scale={1.8} position={[0, -1.8, 0]} />;
}

// Simulated floating particles for weather/environment states
function AmbianceParticles({ type }: { type: string }) {
  const pointsRef = React.useRef<THREE.Points>(null);

  const [positions] = React.useState(() => {
    const arr = new Float32Array(300);
    for (let i = 0; i < 300; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    const positionsArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < 100; i++) {
      const idx = i * 3;
      if (type === 'Rain' || type === 'Snow') {
        // Fall downward
        positionsArr[idx + 1] -= type === 'Rain' ? 0.15 : 0.04;
        if (positionsArr[idx + 1] < -4) positionsArr[idx + 1] = 4;
      } else {
        // Ambient drift
        positionsArr[idx + 1] += Math.sin(time + idx) * 0.002;
        positionsArr[idx] += Math.cos(time + idx) * 0.002;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={type === 'Golden Hour' ? '#ffaa44' : type === 'Rain' ? '#88ccff' : '#ffffff'}
        size={type === 'Snow' ? 0.08 : 0.04}
        transparent
        opacity={0.4}
      />
    </points>
  );
}

interface TrainerCanvasProps {
  environment: 'Morning' | 'Golden Hour' | 'Night Studio' | 'Rain' | 'Snow' | 'Minimal Home' | 'Luxury Gym';
  style: CoachingStyle;
}

export default function HolographicTrainer({ environment, style }: TrainerCanvasProps) {
  // Map environment selection to lights and fog configurations
  const lightColor = React.useMemo(() => {
    switch (environment) {
      case 'Golden Hour': return '#ff8833';
      case 'Rain': return '#6688aa';
      case 'Morning': return '#90e0ff';
      default: return '#ffffff';
    }
  }, [environment]);

  const ambientIntensity = environment === 'Night Studio' ? 0.15 : 0.4;
  const directionalIntensity = environment === 'Golden Hour' ? 1.5 : 1.0;

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#070709', 2, 8]} />
        <ambientLight color="#0a84ff" intensity={ambientIntensity} />
        <directionalLight
          position={[2, 3, 4]}
          color={lightColor}
          intensity={directionalIntensity}
        />
        <pointLight position={[-2, -1, -2]} color="#00f0ff" intensity={0.5} />
        
        <React.Suspense fallback={null}>
          <TrainerModel url="/models/human.glb" intensity={style} />
        </React.Suspense>

        <AmbianceParticles type={environment} />
        
        {environment === 'Night Studio' && (
          <Stars radius={100} depth={50} count={500} factor={4} saturation={0.5} fade speed={1} />
        )}
      </Canvas>

      {/* Holographic grid reflection overlay (spatial depth) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(10,132,255,0.03)_95%,rgba(10,132,255,0.06))] pointer-events-none" />
    </div>
  );
}
