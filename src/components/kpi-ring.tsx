"use client";

import { useEffect, useState } from "react";

interface KPIRingProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  status: "green" | "amber" | "red";
  size?: "sm" | "md" | "lg";
}

const STATUS_COLORS = {
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
};

const SIZES = {
  sm: { ring: 60, stroke: 5, font: "text-sm" },
  md: { ring: 80, stroke: 6, font: "text-xl" },
  lg: { ring: 120, stroke: 8, font: "text-3xl" },
};

export function KPIRing({
  value,
  max,
  label,
  sublabel,
  status,
  size = "md",
}: KPIRingProps) {
  const [animated, setAnimated] = useState(0);
  const config = SIZES[size];
  const color = STATUS_COLORS[status];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min((animated / max) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: config.ring, height: config.ring }}>
        <svg
          width={config.ring}
          height={config.ring}
          viewBox={`0 0 ${config.ring} ${config.ring}`}
          className="-rotate-90"
        >
          {/* Glow filter */}
          <defs>
            <filter id={`glow-${status}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="#e6e8ea"
            strokeWidth={config.stroke}
          />

          {/* Progress */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter={`url(#glow-${status})`}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.font}`} style={{ color }}>
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-400">{sublabel}</p>
        )}
      </div>
    </div>
  );
}