"use client";

import { useRef, Suspense, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

function createGrainTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#222220";
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2 + 0.3;
    const brightness = Math.floor(Math.random() * 20 + 18);
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${Math.random() * 0.35 + 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.2 + 0.2;
    const b = Math.floor(Math.random() * 25 + 35);
    ctx.fillStyle = `rgba(${b}, ${b}, ${b}, ${Math.random() * 0.2 + 0.03})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createRoughnessTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 60;
    const val = Math.min(255, Math.max(0, data[i] + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createBumpTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 80;
    const val = Math.min(255, Math.max(0, 128 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function TrophyModel({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, "/trophy.glb");

  const stoneMaterial = useMemo(() => {
    const colorMap = createGrainTexture(1024);
    const roughnessMap = createRoughnessTexture(512);
    const bumpMap = createBumpTexture(512);
    return new THREE.MeshStandardMaterial({
      map: colorMap,
      roughnessMap,
      roughness: 0.9,
      metalness: 0.03,
      bumpMap,
      bumpScale: 0.015,
      envMapIntensity: 0.5,
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
      // Scroll drives rotation
      groupRef.current.rotation.y = scrollProgress * Math.PI * 2;
      // Subtle tilt based on scroll
      groupRef.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <group scale={1.4} rotation={[-Math.PI / 2, 0, 0]}>
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
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={<FallbackLoader />}>
        <Canvas
          camera={{ position: [0, 0.1, 2.4], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.06} />
          {/* Key light — strong white from top */}
          <spotLight
            position={[2, 8, 4]}
            intensity={3.5}
            angle={0.3}
            penumbra={0.5}
            color="#ffffff"
            castShadow
          />
          {/* Backlight */}
          <spotLight
            position={[0, 1, -4]}
            intensity={3.0}
            angle={0.5}
            penumbra={0.7}
            color="#f0ece0"
          />
          {/* Color pops from the brand palette */}
          <pointLight position={[-4, 3, 2]} intensity={1.2} color="#FFB3AB" />
          <pointLight position={[4, -1, 1]} intensity={0.8} color="#008755" />
          <pointLight position={[0, -3, 3]} intensity={0.6} color="#FFA400" />
          {/* Rim from behind */}
          <spotLight
            position={[-3, 4, -3]}
            intensity={2.0}
            angle={0.35}
            penumbra={0.5}
            color="#e8e4d8"
          />
          <Environment preset="city" background={false} />
          <TrophyModel scrollProgress={scrollProgress} />
        </Canvas>
      </Suspense>
    </div>
  );
}
