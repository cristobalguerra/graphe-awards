"use client";

import React, { MouseEvent, useEffect, useRef, useState } from "react";

interface AwardBadgeProps {
  category: string;
  color?: string;
}

const identityMatrix =
  "1, 0, 0, 0, " +
  "0, 1, 0, 0, " +
  "0, 0, 1, 0, " +
  "0, 0, 0, 1";

const maxRotate = 0.25;
const minRotate = -0.25;
const maxScale = 1;
const minScale = 0.97;

export function AwardBadge({ category, color = "#FFA400" }: AwardBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [firstOverlayPosition, setFirstOverlayPosition] = useState(0);
  const [matrix, setMatrix] = useState(identityMatrix);
  const [currentMatrix, setCurrentMatrix] = useState(identityMatrix);
  const [disableInOutOverlayAnimation, setDisableInOutOverlayAnimation] = useState(true);
  const [disableOverlayAnimation, setDisableOverlayAnimation] = useState(false);
  const [isTimeoutFinished, setIsTimeoutFinished] = useState(false);
  const enterTimeout = useRef<NodeJS.Timeout>(null);
  const leaveTimeout1 = useRef<NodeJS.Timeout>(null);
  const leaveTimeout2 = useRef<NodeJS.Timeout>(null);
  const leaveTimeout3 = useRef<NodeJS.Timeout>(null);

  const getDimensions = () => {
    const left = ref?.current?.getBoundingClientRect()?.left || 0;
    const right = ref?.current?.getBoundingClientRect()?.right || 0;
    const top = ref?.current?.getBoundingClientRect()?.top || 0;
    const bottom = ref?.current?.getBoundingClientRect()?.bottom || 0;
    return { left, right, top, bottom };
  };

  const getMatrix = (clientX: number, clientY: number) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;
    const scale = [
      maxScale - (maxScale - minScale) * Math.abs(xCenter - clientX) / (xCenter - left),
      maxScale - (maxScale - minScale) * Math.abs(yCenter - clientY) / (yCenter - top),
      maxScale - (maxScale - minScale) * (Math.abs(xCenter - clientX) + Math.abs(yCenter - clientY)) / (xCenter - left + yCenter - top),
    ];
    const rotate = {
      x1: 0.25 * ((yCenter - clientY) / yCenter - (xCenter - clientX) / xCenter),
      x2: maxRotate - (maxRotate - minRotate) * Math.abs(right - clientX) / (right - left),
      x3: 0, y0: 0,
      y2: maxRotate - (maxRotate - minRotate) * (top - clientY) / (top - bottom),
      y3: 0,
      z0: -(maxRotate - (maxRotate - minRotate) * Math.abs(right - clientX) / (right - left)),
      z1: 0.2 - (0.2 + 0.6) * (top - clientY) / (top - bottom),
      z3: 0,
    };
    return `${scale[0]}, ${rotate.y0}, ${rotate.z0}, 0, ${rotate.x1}, ${scale[1]}, ${rotate.z1}, 0, ${rotate.x2}, ${rotate.y2}, ${scale[2]}, 0, ${rotate.x3}, ${rotate.y3}, ${rotate.z3}, 1`;
  };

  const getOppositeMatrix = (_matrix: string, clientY: number, onMouseEnter?: boolean) => {
    const { top, bottom } = getDimensions();
    const oppositeY = bottom - clientY + top;
    const weakening = onMouseEnter ? 0.7 : 4;
    const multiplier = onMouseEnter ? -1 : 1;
    return _matrix.split(", ").map((item, index) => {
      if (index === 2 || index === 4 || index === 8) return -parseFloat(item) * multiplier / weakening;
      else if (index === 0 || index === 5 || index === 10) return "1";
      else if (index === 6) return multiplier * (maxRotate - (maxRotate - minRotate) * (top - oppositeY) / (top - bottom)) / weakening;
      else if (index === 9) return (maxRotate - (maxRotate - minRotate) * (top - oppositeY) / (top - bottom)) / weakening;
      return item;
    }).join(", ");
  };

  const onMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    [leaveTimeout1, leaveTimeout2, leaveTimeout3].forEach((t) => { if (t.current) clearTimeout(t.current); });
    setDisableOverlayAnimation(true);
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;
    setDisableInOutOverlayAnimation(false);
    enterTimeout.current = setTimeout(() => setDisableInOutOverlayAnimation(true), 350);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5);
      });
    });
    const m = getMatrix(e.clientX, e.clientY);
    setMatrix(getOppositeMatrix(m, e.clientY, true));
    setIsTimeoutFinished(false);
    setTimeout(() => setIsTimeoutFinished(true), 200);
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;
    setTimeout(() => setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5), 150);
    if (isTimeoutFinished) setCurrentMatrix(getMatrix(e.clientX, e.clientY));
  };

  const onMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const oppositeMatrix = getOppositeMatrix(matrix, e.clientY);
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    setCurrentMatrix(oppositeMatrix);
    setTimeout(() => setCurrentMatrix(identityMatrix), 200);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDisableInOutOverlayAnimation(false);
        leaveTimeout1.current = setTimeout(() => setFirstOverlayPosition(-firstOverlayPosition / 4), 150);
        leaveTimeout2.current = setTimeout(() => setFirstOverlayPosition(0), 300);
        leaveTimeout3.current = setTimeout(() => {
          setDisableOverlayAnimation(false);
          setDisableInOutOverlayAnimation(true);
        }, 500);
      });
    });
  };

  useEffect(() => {
    if (isTimeoutFinished) setMatrix(currentMatrix);
  }, [currentMatrix, isTimeoutFinished]);

  const overlayAnimations = [...Array(10).keys()].map((e) =>
    `@keyframes ga${e + 1}{0%{transform:rotate(${e * 10}deg)}50%{transform:rotate(${(e + 1) * 10}deg)}100%{transform:rotate(${e * 10}deg)}}`
  ).join(" ");

  const overlayColors = [color, "#FFB3AB", "#008755", "#305379", "#DB6B30", "#7C6992", "#C63527", "transparent", "transparent", "white"];

  return (
    <div
      ref={ref}
      className="block w-full max-w-[260px] h-auto cursor-pointer"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <style>{overlayAnimations}</style>
      <div
        style={{
          transform: `perspective(700px) matrix3d(${matrix})`,
          transformOrigin: "center center",
          transition: "transform 200ms ease-out",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 54" className="w-full h-auto">
          <defs>
            <filter id="gablur"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>
            <mask id="gaMask"><rect width="260" height="54" fill="white" rx="10" /></mask>
          </defs>
          <rect width="260" height="54" rx="10" fill="#1a1a18" />
          <rect x="1" y="1" width="258" height="52" rx="9" fill="transparent" stroke={color} strokeWidth="0.5" opacity="0.4" />
          <text fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="700" fill="white" opacity="0.35" x="52" y="19" letterSpacing="2">
            GRAPHĒ AWARDS 2026
          </text>
          <text fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="800" fill="white" opacity="0.7" x="52" y="39">
            {category}
          </text>
          {/* G icon */}
          <rect x="8" y="8" width="38" height="38" rx="8" fill={`${color}15`} />
          <text fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="900" fill={color} x="18" y="35" opacity="0.6">
            G
          </text>
          {/* Overlay */}
          <g style={{ mixBlendMode: "overlay" }} mask="url(#gaMask)">
            {overlayColors.map((c, i) => (
              <g key={i} style={{
                transform: `rotate(${firstOverlayPosition + i * 10}deg)`,
                transformOrigin: "center center",
                transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
                animation: disableOverlayAnimation ? "none" : `ga${i + 1} 5s infinite`,
                willChange: "transform",
              }}>
                <polygon points="0,0 260,54 260,0 0,54" fill={c} filter="url(#gablur)" opacity="0.5" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
