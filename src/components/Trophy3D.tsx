"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { basePath } from "@/lib/basePath";

// Simple hash-based noise for procedural textures
function hash(x: number, y: number, seed: number): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  // Smoothstep
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = hash(ix, iy, seed);
  const n10 = hash(ix + 1, iy, seed);
  const n01 = hash(ix, iy + 1, seed);
  const n11 = hash(ix + 1, iy + 1, seed);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

function fbm(x: number, y: number, octaves: number, seed: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency, seed + i * 43) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value / maxValue;
}

function createGrainTexture(size = 2048): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // High-frequency granular noise — dense packed tiny bumps like sandblasted concrete
  const granuleFreq = 120; // Very high frequency for tiny packed granules
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      // Large-scale subtle variation
      const large = fbm(nx * 5, ny * 5, 3, 1);
      // Dense granular texture — high frequency
      const granule1 = smoothNoise(nx * granuleFreq, ny * granuleFreq, 10);
      const granule2 = smoothNoise(nx * granuleFreq * 1.7, ny * granuleFreq * 1.7, 20);
      const granule3 = smoothNoise(nx * granuleFreq * 0.6, ny * granuleFreq * 0.6, 30);
      // Combined granule: creates dense bumpy pattern
      const granule = granule1 * 0.5 + granule2 * 0.3 + granule3 * 0.2;

      // Each "granule" is a small raised bump — darken valleys, lighten peaks
      const peak = granule > 0.5 ? 1 : 0;
      const peakStrength = Math.abs(granule - 0.5) * 2; // 0-1 distance from midpoint

      // Base very dark — almost black
      const base = 14 + large * 5;
      // Granule creates the bumpy surface look — subtle
      const lit = base + peakStrength * (peak ? 8 : -4);

      // Per-pixel micro noise for extra grit
      const micro = hash(x, y, 777);
      const grit = (micro - 0.5) * 6;

      const val = Math.max(0, Math.min(255, lit + grit));

      // Very subtle warm tint
      const warmShift = (large - 0.5) * 2;
      data[i] = Math.max(0, Math.min(255, val + warmShift));
      data[i + 1] = Math.max(0, Math.min(255, val - 0.3));
      data[i + 2] = Math.max(0, Math.min(255, val - warmShift * 0.3));
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Darken crevices between granules — scattered tiny dark dots
  for (let i = 0; i < 40000; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const pr = Math.random() * 0.8 + 0.2;
    const d = Math.floor(Math.random() * 8 + 4);
    ctx.fillStyle = `rgba(${d}, ${d}, ${d}, ${Math.random() * 0.25 + 0.08})`;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = 4;
  return tex;
}

function createRoughnessTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      // Multi-octave roughness variation
      const rough = fbm(nx * 12, ny * 12, 4, 200);
      const detail = fbm(nx * 40, ny * 40, 3, 300);

      // Base roughness high (matte stone) with variation
      const val = Math.min(255, Math.max(0, 200 + (rough - 0.5) * 60 + (detail - 0.5) * 30));

      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = 4;
  return tex;
}

function createBumpTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      // Dense granular bumps matching the color texture
      const granule1 = smoothNoise(nx * 120, ny * 120, 510);
      const granule2 = smoothNoise(nx * 200, ny * 200, 520);
      const granule3 = smoothNoise(nx * 70, ny * 70, 530);
      // Subtle large undulation
      const large = fbm(nx * 4, ny * 4, 2, 500);
      // Per-pixel grit
      const micro = hash(x, y, 888);

      const val = Math.min(255, Math.max(0,
        128
        + (large - 0.5) * 20
        + (granule1 - 0.5) * 60
        + (granule2 - 0.5) * 35
        + (granule3 - 0.5) * 25
        + (micro - 0.5) * 12
      ));

      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = 4;
  return tex;
}

function ParticleDust({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 400;

  const { positions, speeds, offsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 1.8;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      spd[i] = 0.3 + Math.random() * 0.7;
      off[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, offsets: off };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const baseX = positions[i * 3];
      const baseY = positions[i * 3 + 1];
      const baseZ = positions[i * 3 + 2];
      const speed = speeds[i];
      const offset = offsets[i];

      // Expand with scroll
      const expand = 1 + scrollProgress * 0.5;

      posArray[i * 3] = baseX * expand + Math.sin(time * speed + offset) * 0.05;
      posArray[i * 3 + 1] = baseY * expand + Math.cos(time * speed * 0.7 + offset) * 0.08;
      posArray[i * 3 + 2] = baseZ * expand + Math.sin(time * speed * 0.5 + offset) * 0.05;
    }
    posAttr.needsUpdate = true;

    // Slow rotation
    pointsRef.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.slice(), 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        color="#ffffff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}


function TrophyModel({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, `${basePath}/trophy.glb`);

  const stoneMaterial = useMemo(() => {
    const colorMap = createGrainTexture(2048);
    const roughnessMap = createRoughnessTexture(1024);
    const bumpMap = createBumpTexture(1024);
    return new THREE.MeshStandardMaterial({
      map: colorMap,
      roughnessMap,
      roughness: 0.95,
      metalness: 0.01,
      bumpMap,
      bumpScale: 0.018,
      envMapIntensity: 0.15,
    });
  }, []);

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        (node as THREE.Mesh).material = stoneMaterial;
      }
    });
    return cloned;
  }, [gltf.scene, stoneMaterial]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = scrollProgress * Math.PI * 6;
      groupRef.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <group scale={1.4} position={[0, 0.2, 0]} rotation={[-Math.PI / 2 - 0.3, 0, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function FallbackLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  );
}

export default function Trophy3D({
  scrollProgress = 0,
  className = "",
}: {
  scrollProgress?: number;
  className?: string;
}) {
  return (
    <div className={`w-full h-full relative ${className}`}>
      <Suspense fallback={<FallbackLoader />}>
        <Canvas
          camera={{ position: [0, -0.5, 4.2], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.06} />
          <spotLight
            position={[2, 8, 4]}
            intensity={3.5}
            angle={0.3}
            penumbra={0.5}
            color="#ffffff"
            castShadow
          />
          <spotLight
            position={[0, 1, -4]}
            intensity={3.0}
            angle={0.5}
            penumbra={0.7}
            color="#f0ece0"
          />
          <pointLight position={[-4, 3, 2]} intensity={1.2} color="#FFB3AB" />
          <pointLight position={[4, -1, 1]} intensity={0.8} color="#008755" />
          <pointLight position={[0, -3, 3]} intensity={0.6} color="#FFA400" />
          <spotLight
            position={[-3, 4, -3]}
            intensity={2.0}
            angle={0.35}
            penumbra={0.5}
            color="#e8e4d8"
          />
          <Environment preset="city" background={false} />
          <TrophyModel scrollProgress={scrollProgress} />
          <ParticleDust scrollProgress={scrollProgress} />
        </Canvas>
      </Suspense>
    </div>
  );
}
