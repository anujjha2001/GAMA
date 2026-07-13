'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedHeart() {
  const groupRef = React.useRef<THREE.Group>(null);
  const heartMeshRef = React.useRef<THREE.Mesh>(null);

  // Generate organic heart shape by deforming a sphere
  const heartGeo = React.useMemo(() => {
    const geo = new THREE.SphereGeometry(0.85, 96, 96);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Organic heart formula deformation:
      // Taper at the bottom (apex)
      if (y < 0) {
        x *= (1 + y * 0.35);
        z *= (1 + y * 0.35);
      }
      // Heart indentation at top
      if (y > 0.2) {
        y -= Math.abs(x) * 0.15;
      }
      
      // Pull apex down
      const apexPull = -0.15 * Math.exp(-x*x - z*z);
      y += apexPull;

      // Make it slightly flatter
      z *= 0.85;

      pos.setXYZ(i, x * 1.15, y * 1.2, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Procedural blood vessels wrapping the surface
  const vessels = React.useMemo(() => {
    const curves = [
      // Left Coronary Artery branch
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.05, 0.5, 0.4),
        new THREE.Vector3(0.18, 0.2, 0.52),
        new THREE.Vector3(0.32, -0.1, 0.48),
        new THREE.Vector3(0.28, -0.4, 0.38),
        new THREE.Vector3(0.12, -0.7, 0.15),
      ]),
      // Right Coronary Artery branch
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.05, 0.5, 0.4),
        new THREE.Vector3(-0.2, 0.25, 0.5),
        new THREE.Vector3(-0.35, -0.05, 0.48),
        new THREE.Vector3(-0.4, -0.35, 0.35),
        new THREE.Vector3(-0.25, -0.65, 0.2),
        new THREE.Vector3(-0.05, -0.85, 0.05),
      ]),
      // Anterior Interventricular branch (center vein)
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 0.4, 0.45),
        new THREE.Vector3(0.05, 0.1, 0.55),
        new THREE.Vector3(0.0, -0.2, 0.5),
        new THREE.Vector3(-0.08, -0.5, 0.35),
        new THREE.Vector3(-0.02, -0.8, 0.15),
      ]),
      // Back branch
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.1, 0.3, -0.45),
        new THREE.Vector3(0.25, -0.1, -0.48),
        new THREE.Vector3(0.15, -0.5, -0.38),
      ]),
    ];
    return curves;
  }, []);

  // Main vessels on top (Aorta & Vena Cava)
  const aortaCurve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, 0.55, 0.05),
      new THREE.Vector3(0.25, 0.9, 0.1),
      new THREE.Vector3(0.18, 1.15, -0.15),
      new THREE.Vector3(-0.15, 1.0, -0.25),
    ]);
  }, []);

  const venaCavaCurve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 0.5, 0.0),
      new THREE.Vector3(-0.28, 0.95, -0.05),
      new THREE.Vector3(-0.25, 1.15, -0.1),
    ]);
  }, []);

  const pulmonaryCurve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.5, 0.15),
      new THREE.Vector3(-0.08, 0.85, 0.25),
      new THREE.Vector3(-0.28, 0.95, 0.3),
    ]);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow luxurious rotation
    groupRef.current.rotation.y = time * 0.2;
    
    // Pulse animation (heartbeat style: double pulse)
    const pulseFactor = Math.sin(time * 2.0);
    const pulseMod = Math.max(0, pulseFactor) * 0.04 + (Math.sin(time * 4.0 + 0.5) > 0.8 ? 0.02 : 0);
    const scale = 1.35 + pulseMod;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef}>
      {/* Central Heart Body */}
      <mesh ref={heartMeshRef} geometry={heartGeo}>
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#012b30"
          roughness={0.12}
          metalness={0.92}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          transmission={0.35}
          thickness={1.8}
          ior={1.65}
          attenuationColor="#0891b2"
          attenuationDistance={0.5}
        />
      </mesh>

      {/* Aorta Tube */}
      <mesh>
        <tubeGeometry args={[aortaCurve, 32, 0.12, 16, false]} />
        <meshPhysicalMaterial
          color="#0891b2"
          emissive="#022c22"
          roughness={0.15}
          metalness={0.85}
          clearcoat={1.0}
          transmission={0.2}
          thickness={1.0}
        />
      </mesh>

      {/* Vena Cava Tube */}
      <mesh>
        <tubeGeometry args={[venaCavaCurve, 24, 0.1, 16, false]} />
        <meshPhysicalMaterial
          color="#1e1b4b"
          emissive="#0c0a09"
          roughness={0.2}
          metalness={0.8}
          clearcoat={0.8}
        />
      </mesh>

      {/* Pulmonary Artery */}
      <mesh>
        <tubeGeometry args={[pulmonaryCurve, 24, 0.09, 16, false]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive="#022c22"
          roughness={0.15}
          metalness={0.85}
          clearcoat={0.9}
        />
      </mesh>

      {/* Vascular Network Tubes wrapping heart surface */}
      {vessels.map((curve, idx) => (
        <mesh key={idx}>
          <tubeGeometry args={[curve, 32, 0.024, 8, false]} />
          <meshPhysicalMaterial
            color={idx % 2 === 0 ? "#06b6d4" : "#a855f7"}
            emissive={idx % 2 === 0 ? "#083344" : "#3b0764"}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1.0}
          />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const ref = React.useRef<THREE.Points>(null);
  
  const [positions] = React.useState(() => {
    const arr = new Float32Array(250 * 3);
    for (let i = 0; i < 250; i++) {
      // Keep them loosely orbiting around the center heart area
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 3.5;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  });

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    ref.current.rotation.y = time * 0.05;
    ref.current.rotation.x = time * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#06b6d4"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

export default function HealthOrb3D() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] md:h-[600px] relative flex items-center justify-center bg-transparent">
        <div className="h-48 w-48 rounded-full bg-cyan-500/10 animate-pulse blur-xl" />
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] md:h-[600px] relative flex items-center justify-center">
      {/* Cybernetic ambient mapping grid in backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-30 pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0.1, 3.4], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#c084fc" />
        <directionalLight position={[5, 15, 5]} intensity={2.0} color="#ffffff" />
        <AnimatedHeart />
        <ParticleField />
      </Canvas>
    </div>
  );
}

