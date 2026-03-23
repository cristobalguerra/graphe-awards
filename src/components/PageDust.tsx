"use client";

import { useEffect, useRef } from "react";

// Category shape drawing functions
type ShapeDrawer = (ctx: CanvasRenderingContext2D, s: number, color: string) => void;

const drawCircle: ShapeDrawer = (ctx, s, color) => {
  ctx.beginPath();
  ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
  ctx.fill();
};

const drawSquare: ShapeDrawer = (ctx, s, color) => {
  ctx.fillRect(-s / 2, -s / 2, s, s);
};

const drawShield: ShapeDrawer = (ctx, s, color) => {
  const h = s * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(h * 0.8, -h * 0.5);
  ctx.lineTo(h * 0.8, h * 0.4);
  ctx.quadraticCurveTo(0, h, 0, h);
  ctx.quadraticCurveTo(0, h, -h * 0.8, h * 0.4);
  ctx.lineTo(-h * 0.8, -h * 0.5);
  ctx.closePath();
  ctx.fill();
};

const drawArch: ShapeDrawer = (ctx, s, color) => {
  const h = s * 0.5;
  ctx.beginPath();
  ctx.moveTo(-h, h);
  ctx.lineTo(-h, -h * 0.2);
  ctx.quadraticCurveTo(-h, -h, 0, -h);
  ctx.quadraticCurveTo(h, -h, h, -h * 0.2);
  ctx.lineTo(h, h);
  ctx.closePath();
  ctx.fill();
};

const drawDots: ShapeDrawer = (ctx, s, color) => {
  const r = s * 0.2;
  const off = s * 0.25;
  ctx.beginPath();
  ctx.arc(-off, -off, r, 0, Math.PI * 2);
  ctx.arc(off, -off, r, 0, Math.PI * 2);
  ctx.arc(-off, off, r, 0, Math.PI * 2);
  ctx.arc(off, off, r, 0, Math.PI * 2);
  ctx.fill();
};

const drawPentagon: ShapeDrawer = (ctx, s, color) => {
  const h = s * 0.45;
  ctx.beginPath();
  ctx.moveTo(-h, -h * 0.6);
  ctx.quadraticCurveTo(-h, -h, 0, -h);
  ctx.quadraticCurveTo(h, -h, h, -h * 0.6);
  ctx.lineTo(h, h * 0.4);
  ctx.quadraticCurveTo(h, h, 0, h);
  ctx.quadraticCurveTo(-h, h, -h, h * 0.4);
  ctx.closePath();
  ctx.fill();
};

const drawFlower: ShapeDrawer = (ctx, s, color) => {
  const r = s * 0.25;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, -r * 1.2, r * 0.5, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

const drawLogo: ShapeDrawer = (ctx, s, color) => {
  const h = s * 0.45;
  // Left pill
  const rr = h * 0.4;
  ctx.beginPath();
  ctx.roundRect(-h, -h, h * 0.8, h * 2, rr);
  ctx.fill();
  // Right rect
  ctx.beginPath();
  ctx.roundRect(h * 0.05, -h, h * 0.9, h * 2, h * 0.1);
  ctx.fill();
};

const SHAPES: { draw: ShapeDrawer; color: string }[] = [
  { draw: drawCircle, color: "#FFB3AB" },
  { draw: drawShield, color: "#008755" },
  { draw: drawLogo, color: "#305379" },
  { draw: drawSquare, color: "#DB6B30" },
  { draw: drawArch, color: "#7C6992" },
  { draw: drawPentagon, color: "#00594F" },
  { draw: drawDots, color: "#C63527" },
  { draw: drawFlower, color: "#FFA400" },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  shapeIdx: number;
}

export default function PageDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    const createParticles = () => {
      particles.length = 0;
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < Math.min(count, 200); i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          size: Math.random() * 22 + 6, // 6px to 28px
          opacity: Math.random() * 0.18 + 0.04,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.003,
          shapeIdx: Math.floor(Math.random() * SHAPES.length),
        });
      }
    };

    resize();
    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const shape = SHAPES[p.shapeIdx];

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = shape.color;
        shape.draw(ctx, p.size, shape.color);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animate();

    const ro = new ResizeObserver(resize);
    ro.observe(document.body);
    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.85 }}
    />
  );
}
