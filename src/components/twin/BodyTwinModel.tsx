'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  layer: string;
  recoveryScore: number;
  stressLevel: number;
  selectedOrgan: string | null;
  onSelectOrgan: (organ: string) => void;
  heartRate: number;
}

// Fallback Procedural Holographic Human
function HolographicHuman({ layer, recoveryScore, stressLevel, selectedOrgan, onSelectOrgan, heartRate }: ModelProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const heartRef = React.useRef<THREE.Mesh>(null);

  // Generate particle systems for the layers
  const particles = React.useMemo(() => {
    const count = 400;
    const tempPositions = new Float32Array(count * 3);
    const tempSpeeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Cylinder-ish human silhouette positioning
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4.5;
      
      // Taper for body silhouette (head, chest, waist, legs)
      let radius = 0.5;
      if (height > 1.8) {
        // Head
        radius = 0.28 * Math.sqrt(Math.max(0, 1 - Math.pow((height - 2.1) / 0.4, 2)));
      } else if (height > 0.8) {
        // Torso/Chest
        radius = 0.58;
      } else if (height > -0.2) {
        // Waist
        radius = 0.45;
      } else {
        // Legs
        radius = 0.35 - (height * 0.05);
      }
      
      const x = Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
      const z = Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
      const y = height;

      tempPositions[i * 3] = x;
      tempPositions[i * 3 + 1] = y;
      tempPositions[i * 3 + 2] = z;
      
      tempSpeeds[i] = 0.02 + Math.random() * 0.04;
    }
    return { positions: tempPositions, speeds: tempSpeeds };
  }, []);

  const pointsRef = React.useRef<THREE.Points>(null);

  // Breathing & heartbeat micro animations
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 1. Breathing speed & depth derived from biometrics (high stress = faster, shallow; good recovery = slow, deep)
    const breathingSpeed = stressLevel > 7 ? 3.0 : 1.5;
    const breathingAmp = recoveryScore > 75 ? 0.03 : 0.015;
    const breatheFactor = 1.0 + Math.sin(time * breathingSpeed) * breathingAmp;
    
    if (groupRef.current) {
      groupRef.current.scale.set(breatheFactor, breatheFactor + (Math.sin(time * breathingSpeed) * 0.01), breatheFactor);
      
      // Idle slow sway
      groupRef.current.rotation.y = time * 0.15;
    }

    // 2. Heart rate pulse
    if (heartRef.current) {
      const beatFreq = (heartRate / 60) * Math.PI * 2;
      const pulse = 1.0 + Math.sin(time * beatFreq) * 0.15;
      heartRef.current.scale.set(pulse, pulse, pulse);
    }

    // 3. Flowing biological particles
    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const positions = geo.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      
      // Speed multiplier influenced by layer & hydration (low hydration = slower circulation)
      let speedFactor = 1.0;
      if (layer === 'Cardiovascular' || layer === 'Blood Flow') speedFactor = 2.0;
      else if (layer === 'Metabolism') speedFactor = 1.6;

      for (let i = 0; i < count; i++) {
        // Move particles upwards/downwards depending on index
        positions[i * 3 + 1] += particles.speeds[i] * speedFactor * (i % 2 === 0 ? 1 : -1);
        
        // Reset boundaries
        if (positions[i * 3 + 1] > 2.3) positions[i * 3 + 1] = -2.3;
        if (positions[i * 3 + 1] < -2.3) positions[i * 3 + 1] = 2.3;
      }
      geo.attributes.position.needsUpdate = true;
    }
  });

  // Layer configuration mapping for procedural materials & colors
  const layerColors: Record<string, { material: string; particles: string; light: string }> = {
    Cardiovascular: { material: '#ef4444', particles: '#f87171', light: '#ef4444' },
    'Nervous System': { material: '#06b6d4', particles: '#22d3ee', light: '#06b6d4' },
    Respiratory: { material: '#3b82f6', particles: '#60a5fa', light: '#3b82f6' },
    Muscular: { material: '#0a84ff', particles: '#80c0ff', light: '#0a84ff' },
    Skeletal: { material: '#e5e5e5', particles: '#a3a3a3', light: '#ffffff' },
    Digestive: { material: '#10b981', particles: '#34d399', light: '#10b981' },
    Metabolism: { material: '#eab308', particles: '#fde047', light: '#eab308' },
    'Energy Flow': { material: '#c084fc', particles: '#e9d5ff', light: '#c084fc' },
    'Recovery Layer': { material: '#0a84ff', particles: '#cce6ff', light: '#0a84ff' },
  };

  const activeTheme = layerColors[layer] || layerColors['Recovery Layer'];

  return (
    <group ref={groupRef}>
      {/* 3D Holographic Core Wireframe Structure */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 4.0, 16, 16, true]} />
        <meshBasicMaterial 
          color={activeTheme.material} 
          wireframe 
          transparent 
          opacity={0.12} 
        />
      </mesh>

      {/* Head Hologram */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color={activeTheme.material} 
          wireframe 
          transparent 
          opacity={0.18} 
        />
      </mesh>

      {/* Pulsing Biological Heart */}
      <mesh ref={heartRef} position={[0, 0.9, 0.15]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('Heart'); }}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ef4444" 
          emissive="#ef4444" 
          emissiveIntensity={2} 
        />
      </mesh>

      {/* Active Layer Flowing Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color={activeTheme.particles} 
          size={0.038} 
          transparent 
          opacity={0.7} 
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Clickable Organ Hotspots (Invisible interactive meshes that trigger selections) */}
      {/* Brain */}
      <mesh position={[0, 2.1, 0]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('Brain'); }}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color={selectedOrgan === 'Brain' ? '#0a84ff' : activeTheme.material} transparent opacity={0.25} />
      </mesh>

      {/* Lungs */}
      <mesh position={[0, 1.1, -0.1]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('Lungs'); }}>
        <boxGeometry args={[0.35, 0.4, 0.2]} />
        <meshBasicMaterial color={selectedOrgan === 'Lungs' ? '#0a84ff' : activeTheme.material} transparent opacity={0.15} />
      </mesh>

      {/* Digestive */}
      <mesh position={[0, 0.4, 0.05]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('Stomach'); }}>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
        <meshBasicMaterial color={selectedOrgan === 'Stomach' ? '#0a84ff' : activeTheme.material} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// GLTF Loader Component loading model
function GLTFModel({ url, props }: { url: string; props: ModelProps }) {
  const { scene } = useGLTF(url);
  const modelRef = React.useRef<THREE.Group>(null);
  const heartRef = React.useRef<THREE.Mesh>(null);

  // Animate the GLTF nodes
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const breathingSpeed = props.stressLevel > 7 ? 2.8 : 1.4;
    const breathingAmp = props.recoveryScore > 75 ? 0.02 : 0.01;
    const breatheFactor = 1.0 + Math.sin(time * breathingSpeed) * breathingAmp;

    if (modelRef.current) {
      modelRef.current.scale.set(breatheFactor, breatheFactor, breatheFactor);
      modelRef.current.rotation.y = time * 0.1;
    }

    if (heartRef.current) {
      const beatFreq = (props.heartRate / 60) * Math.PI * 2;
      const pulse = 1.0 + Math.sin(time * beatFreq) * 0.12;
      heartRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Assign materials dynamically based on active biological layer
  React.useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Soft glowing translucent biological shell
        child.material = new THREE.MeshPhysicalMaterial({
          color: props.layer === 'Cardiovascular' ? '#ef4444' : props.layer === 'Nervous System' ? '#06b6d4' : '#0a84ff',
          emissive: props.layer === 'Nervous System' ? '#0891b2' : '#7c2d12',
          emissiveIntensity: 0.8,
          roughness: 0.25,
          metalness: 0.1,
          transparent: true,
          opacity: 0.35,
          wireframe: props.layer === 'Skeletal',
        });
      }
    });
  }, [scene, props.layer]);

  return (
    <group ref={modelRef}>
      <primitive object={scene} scale={1.8} position={[0, -1.8, 0]} />
      {/* Heart indicator on top of model */}
      <mesh ref={heartRef} position={[0, 0.4, 0.18]} onClick={(e) => { e.stopPropagation(); props.onSelectOrgan('Heart'); }}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

// Camera Director Script inside R3F Context
function CameraDirector({ selectedOrgan }: { selectedOrgan: string | null }) {
  useFrame((state) => {
    // Zoom/offset vectors depending on active organ focus
    let targetPos = new THREE.Vector3(0, 0, 4.0); // Default idle framing
    let targetLook = new THREE.Vector3(0, 0.3, 0);

    if (selectedOrgan) {
      switch (selectedOrgan.toLowerCase()) {
        case 'brain':
          targetPos.set(0, 2.1, 1.4);
          targetLook.set(0, 2.1, 0);
          break;
        case 'heart':
          targetPos.set(0, 0.9, 1.2);
          targetLook.set(0, 0.9, 0);
          break;
        case 'lungs':
          targetPos.set(0, 1.1, 1.3);
          targetLook.set(0, 1.1, 0);
          break;
        case 'stomach':
        case 'liver':
        case 'digestive':
          targetPos.set(0, 0.4, 1.25);
          targetLook.set(0, 0.4, 0);
          break;
      }
    } else {
      // Idle slow camera rotation parallax
      const time = state.clock.getElapsedTime();
      targetPos.x = Math.sin(time * 0.08) * 0.8;
    }

    state.camera.position.lerp(targetPos, 0.05);
    // Smoothly pivot lookAt
    const currentLook = new THREE.Vector3(0, 0, 0);
    currentLook.lerp(targetLook, 0.05);
  });

  return null;
}

export default function BodyTwinModel(props: ModelProps) {
  const [useFallback, setUseFallback] = React.useState(false);

  return (
    <div className="w-full h-full relative z-10 cursor-pointer min-h-[500px]">
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        
        {/* Dynamic biological overlay lights */}
        <pointLight 
          position={[0, 2.5, 2]} 
          intensity={2.0} 
          color={props.layer === 'Nervous System' ? '#22d3ee' : '#0a84ff'} 
        />
        
        <pointLight 
          position={[0, -1, -2]} 
          intensity={1.0} 
          color="#3b82f6" 
        />

        <React.Suspense fallback={<HolographicHuman {...props} />}>
          {!useFallback ? (
            <GLTFModel 
              url="/models/human.glb" 
              props={props} 
            />
          ) : (
            <HolographicHuman {...props} />
          )}
        </React.Suspense>

        <CameraDirector selectedOrgan={props.selectedOrgan} />
      </Canvas>
    </div>
  );
}
