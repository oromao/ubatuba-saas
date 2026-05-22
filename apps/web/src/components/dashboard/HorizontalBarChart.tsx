"use client";

import { useEffect, useState } from "react";

export interface BarItem {
  label: string;
  value: number;
  color: string; // Ex: 'blue', 'emerald', 'amber', 'rose', 'violet'
  subtitle?: string;
}

interface HorizontalBarChartProps {
  data: BarItem[];
  className?: string;
}

const GRADIENTS = {
  blue: { bg: "bg-gradient-to-r from-blue-500 to-cyan-500", text: "text-blue-500", border: "border-blue-200" },
  emerald: { bg: "bg-gradient-to-r from-emerald-500 to-teal-500", text: "text-emerald-500", border: "border-emerald-200" },
  amber: { bg: "bg-gradient-to-r from-amber-500 to-yellow-500", text: "text-amber-500", border: "border-amber-200" },
  rose: { bg: "bg-gradient-to-r from-rose-500 to-pink-500", text: "text-rose-500", border: "border-rose-200" },
  violet: { bg: "bg-gradient-to-r from-violet-500 to-indigo-500", text: "text-violet-500", border: "border-violet-200" },
};

export default function HorizontalBarChart({ data, className = "" }: HorizontalBarChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const gradConfig = GRADIENTS[item.color as keyof typeof GRADIENTS] || GRADIENTS.blue;
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={index}
            className={`group relative flex flex-col gap-1.5 rounded-lg p-2.5 transition-all duration-200 ${
              isHovered ? "bg-surface-elevated shadow-sm" : "hover:bg-surface-elevated/40"
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Rótulo e Valor */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-on-surface-muted">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <span className={`font-bold ${gradConfig.text} text-base`}>
                {item.value}
              </span>
            </div>

            {/* Barra */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-outline/20">
              <div
                className={`h-full rounded-full ${gradConfig.bg} transition-all duration-1000 ease-out`}
                style={{
                  width: `${mounted ? percentage : 0}%`,
                }}
              />
            </div>

            {/* Micro-glow sutil no hover */}
            {isHovered && (
              <div
                className="absolute inset-0 -z-10 rounded-lg opacity-10 bg-gradient-to-r from-transparent to-surface"
                style={{
                  transition: "opacity 0.3s ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
