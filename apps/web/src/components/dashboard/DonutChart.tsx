"use client";

import { useEffect, useState } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string; // Ex: 'blue', 'emerald', 'amber', 'rose', 'violet'
  displayValue?: string; // Valor opcional já formatado
}

interface DonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

const GRADIENTS = {
  blue: { id: "donut-grad-blue", start: "#3b82f6", end: "#06b6d4", bg: "bg-blue-500", text: "text-blue-500" },
  emerald: { id: "donut-grad-emerald", start: "#10b981", end: "#14b8a6", bg: "bg-emerald-500", text: "text-emerald-500" },
  amber: { id: "donut-grad-amber", start: "#f59e0b", end: "#eab308", bg: "bg-amber-500", text: "text-amber-500" },
  rose: { id: "donut-grad-rose", start: "#f43f5e", end: "#ec4899", bg: "bg-rose-500", text: "text-rose-500" },
  violet: { id: "donut-grad-violet", start: "#8b5cf6", end: "#6366f1", bg: "bg-violet-500", text: "text-violet-500" },
};

export default function DonutChart({ data, centerLabel, centerValue, className = "" }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // Dispara a animação após a montagem do componente no cliente
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = 50;
  const strokeWidth = 14;
  const strokeWidthHover = 18;
  const circumference = 2 * Math.PI * radius; // ~314.16

  let accumulatedPercent = 0;

  return (
    <div className={`flex flex-col items-center justify-center gap-6 sm:flex-row ${className}`}>
      {/* SVG Container */}
      <div className="relative h-44 w-44 shrink-0">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90 transform"
        >
          <defs>
            {Object.values(GRADIENTS).map((grad) => (
              <linearGradient key={grad.id} id={grad.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={grad.start} />
                <stop offset="100%" stopColor={grad.end} />
              </linearGradient>
            ))}
            {/* Filtro de sombra para o hover */}
            <filter id="donut-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" floodColor="#000" />
            </filter>
          </defs>

          {/* Círculo de fundo cinza sutil */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="var(--outline, #e2e8f0)"
            strokeWidth={strokeWidth - 2}
            className="opacity-20"
          />

          {/* Fatias do Donut */}
          {data.map((item, index) => {
            const percentage = total > 0 ? item.value / total : 0;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - (mounted ? strokeLength : 0);
            const rotationOffset = (accumulatedPercent * circumference);
            accumulatedPercent += percentage;

            const gradConfig = GRADIENTS[item.color as keyof typeof GRADIENTS] || GRADIENTS.blue;
            const isHovered = hoveredIndex === index;

            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={`url(#${gradConfig.id})`}
                strokeWidth={isHovered ? strokeWidthHover : strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={-rotationOffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transition: "stroke-width 0.3s ease, filter 0.3s ease",
                  filter: isHovered ? "url(#donut-shadow)" : "none",
                  cursor: "pointer",
                }}
              />
            );
          })}
        </svg>

        {/* Informações centrais */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-muted">
            {hoveredIndex !== null ? data[hoveredIndex].label : centerLabel || "Total"}
          </span>
          <span className="text-xl font-bold tracking-tight text-on-surface transition-all duration-300">
            {hoveredIndex !== null
              ? data[hoveredIndex].displayValue || data[hoveredIndex].value
              : centerValue || total}
          </span>
          {hoveredIndex !== null && total > 0 && (
            <span className="text-[10px] font-medium text-green-600 animate-fade-in">
              {((data[hoveredIndex].value / total) * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Legenda Lateral */}
      <div className="flex flex-col gap-2.5 w-full">
        {data.map((item, index) => {
          const gradConfig = GRADIENTS[item.color as keyof typeof GRADIENTS] || GRADIENTS.blue;
          const isHovered = hoveredIndex === index;
          const percent = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <div
              key={index}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 transition-all duration-200 ${
                isHovered ? "bg-surface-elevated shadow-sm scale-[1.02]" : "hover:bg-surface-elevated/40"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-3 w-3 rounded-full ${gradConfig.bg} shrink-0`} />
                <span className={`text-sm font-medium transition-colors ${isHovered ? "text-on-surface" : "text-on-surface-muted"}`}>
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-on-surface">
                  {item.displayValue || item.value}
                </span>
                <span className="ml-2 text-xs text-on-surface-muted">
                  ({percent.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
