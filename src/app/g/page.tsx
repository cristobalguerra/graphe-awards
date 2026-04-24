"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { basePath } from "@/lib/basePath";

// G path extracted from public/logo-graphe.svg
const G_PATH =
  "M203.18,107.57c-13.47,3.78-30.23,5.7-43.78,1.34-9.43-3.04-11.96-18.86-25.04-25.57-28.19-14.46-67.81-4-79.48,26.61-13.7,35.94-5.3,92.16,39.68,98.31,26.38,3.61,49.82-1.97,59.62-28.89,4.98-13.68,2.21-14.51-12.18-16.26-10.49-1.27-41.34,1.54-46.7-6.2-21.36-30.85,46.41-24.05,60.87-23.89,11.51.13,24.14-1.71,36.48.12,17.59,2.61,14.57,16.96,12.26,32.54-2.78,18.77-15.04,45.83-29.46,57.95-32.87,27.62-96.54,27.81-132.54,6.36-56.97-33.95-56.88-137.03-1.82-172.94,50.59-32.99,150-19.01,162.07,50.51Z";

// ─── 3D G built from brand path ───────────────────────────────────────────────
function SpinningG() {
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    // Use SVGLoader to parse the path string into shapes
    const loader = new SVGLoader();
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 250"><path d="${G_PATH}"/></svg>`;
    const data = loader.parse(svgMarkup);

    const shapes: THREE.Shape[] = [];
    data.paths.forEach((path) => {
      path.toShapes(true).forEach((s) => shapes.push(s));
    });

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 40,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 2,
      bevelSegments: 4,
      curveSegments: 32,
    });

    // Center geometry
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const cx = (box.max.x + box.min.x) / 2;
    const cy = (box.max.y + box.min.y) / 2;
    const cz = (box.max.z + box.min.z) / 2;
    geo.translate(-cx, -cy, -cz);

    // SVG Y axis is flipped vs Three.js
    geo.rotateZ(Math.PI);
    geo.rotateY(Math.PI);

    return geo;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group ref={groupRef} scale={0.014}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.35} />
      </mesh>
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
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#00FF00" }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#00FF00"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 4]} intensity={1.4} />
          <directionalLight position={[-4, 2, 3]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, -3, 3]} intensity={0.5} color="#ffffff" />
          <SpinningG />
        </Canvas>
      )}
    </div>
  );
}
