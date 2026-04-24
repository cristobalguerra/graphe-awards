"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { basePath } from "@/lib/basePath";

// ─── Noise helpers (same as Trophy3D) ─────────────────────────────────────────
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
  const granuleFreq = 120;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;
      const large = fbm(nx * 5, ny * 5, 3, 1);
      const granule1 = smoothNoise(nx * granuleFreq, ny * granuleFreq, 10);
      const granule2 = smoothNoise(nx * granuleFreq * 1.7, ny * granuleFreq * 1.7, 20);
      const granule3 = smoothNoise(nx * granuleFreq * 0.6, ny * granuleFreq * 0.6, 30);
      const granule = granule1 * 0.5 + granule2 * 0.3 + granule3 * 0.2;
      const peak = granule > 0.5 ? 1 : 0;
      const peakStrength = Math.abs(granule - 0.5) * 2;
      const base = 14 + large * 5;
      const lit = base + peakStrength * (peak ? 8 : -4);
      const micro = hash(x, y, 777);
      const grit = (micro - 0.5) * 6;
      const val = Math.max(0, Math.min(255, lit + grit));
      const warmShift = (large - 0.5) * 2;
      data[i] = Math.max(0, Math.min(255, val + warmShift));
      data[i + 1] = Math.max(0, Math.min(255, val - 0.3));
      data[i + 2] = Math.max(0, Math.min(255, val - warmShift * 0.3));
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
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
      const rough = fbm(nx * 12, ny * 12, 4, 200);
      const detail = fbm(nx * 40, ny * 40, 3, 300);
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
      const granule1 = smoothNoise(nx * 120, ny * 120, 510);
      const granule2 = smoothNoise(nx * 200, ny * 200, 520);
      const granule3 = smoothNoise(nx * 70, ny * 70, 530);
      const large = fbm(nx * 4, ny * 4, 2, 500);
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

// ─── Trophy G model with textures ─────────────────────────────────────────────
function TrophyG() {
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

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed inset-0" style={{ background: "#00FF00" }}>
      {mounted && (
        <Canvas
          camera={{ position: [0, -0.5, 4.2], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#00FF00" }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#00FF00"]} />
          <ambientLight intensity={0.06} />
          <spotLight
            position={[2, 8, 4]}
            intensity={3.5}
            angle={0.3}
            penumbra={0.5}
            color="#ffffff"
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
          <Suspense fallback={null}>
            <Environment preset="city" background={false} />
            <TrophyG />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
