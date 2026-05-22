"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

/* ── helpers ────────────────────────────────────────────────────────── */
const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(0, 72%, 51%)",
  "hsl(187, 78%, 39%)",
  "hsl(330, 81%, 60%)",
];

/* ── IPTU Bar Chart ──────────────────────────────────────────────────── */
export function IptuBarChart({
  lancado, pago, aberto,
}: {
  lancado: number; pago: number; aberto: number;
}) {
  const data = [
    { name: "Lançado", valor: lancado, fill: "hsl(221, 83%, 53%)" },
    { name: "Pago", valor: pago, fill: "hsl(142, 76%, 36%)" },
    { name: "Em Aberto", valor: aberto, fill: "hsl(38, 92%, 50%)" },
  ];
  return (
    <div className="rounded-md border p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
        IPTU — Comparativo
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => (v / 1000).toFixed(0) + "k"} />
          <Tooltip formatter={(v) => currency(Number(v))} />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── CTM Status Pie Chart ────────────────────────────────────────────── */
export function CtmStatusPie({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  const chartData = entries.map(([name, value], i) => ({
    name,
    value,
    fill: COLORS[i % COLORS.length],
  }));
  return (
    <div className="rounded-md border p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
        Distribuição por Status
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) => (
              <span className="text-on-surface-muted">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Secretaria Horizontal Bar ───────────────────────────────────────── */
export function SecretariaChart({
  data,
}: {
  data: Array<{ name: string; total: number; status: string }>;
}) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => {
        const pct = (item.total / maxVal) * 100;
        return (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs font-medium text-on-surface">
              {item.name}
            </span>
            <div className="flex-1">
              <div className="h-5 w-full overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: `oklch(from ${item.status === "operacional" ? "hsl(142, 76%, 36%)" : item.status === "monitoramento" ? "hsl(38, 92%, 50%)" : item.status === "fila" ? "hsl(221, 83%, 53%)" : "hsl(262, 83%, 58%)"} l c h)` }}
                />
              </div>
            </div>
            <span className="w-8 text-right text-xs font-semibold text-on-surface">
              {item.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Satellite Health Stacked Bar ────────────────────────────────────── */
export function SatelliteHealthChart({
  data,
}: {
  data: Array<{ id: string; label: string; total: number; open: number; inProgress: number; closed: number }>;
}) {
  return (
    <div className="space-y-2">
      {data.map((item) => {
        const maxV = Math.max(item.total, 1);
        const openPct = (item.open / maxV) * 100;
        const inProgPct = (item.inProgress / maxV) * 100;
        const closedPct = (item.closed / maxV) * 100;
        return (
          <div key={item.id} className="rounded-md border border-outline bg-surface-elevated p-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface">{item.label}</span>
              <span className="text-xs text-on-surface-muted">{item.total} total</span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-secondary">
              <div
                className="h-full rounded-l-full transition-all"
                style={{ width: `${Math.max(openPct, item.open > 0 ? 4 : 0)}%`, backgroundColor: "hsl(38, 92%, 50%)" }}
                title={`${item.open} abertos`}
              />
              <div
                className="h-full transition-all"
                style={{ width: `${Math.max(inProgPct, item.inProgress > 0 ? 4 : 0)}%`, backgroundColor: "hsl(221, 83%, 53%)" }}
                title={`${item.inProgress} em andamento`}
              />
              <div
                className="h-full rounded-r-full transition-all"
                style={{ width: `${Math.max(closedPct, item.closed > 0 ? 4 : 0)}%`, backgroundColor: "hsl(142, 76%, 36%)" }}
                title={`${item.closed} encerrados`}
              />
            </div>
            <div className="mt-1 flex gap-3 text-[10px] text-on-surface-muted">
              <span>● {item.open} abertos</span>
              <span>● {item.inProgress} andamento</span>
              <span>● {item.closed} encerrados</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Readiness Signals ───────────────────────────────────────────────── */
export function ReadinessChart({
  data,
}: {
  data: Array<{ label: string; value: number; note: string }>;
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="rounded-md border border-outline bg-surface-elevated p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface">{item.label}</span>
            <span className={`text-xs font-semibold ${item.value > 0 ? "text-green-600" : "text-amber-600"}`}>
              {item.value > 0 ? "OK" : "PENDENTE"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${item.value > 0 ? 100 : 15}%`,
                backgroundColor: item.value > 0 ? "hsl(142, 76%, 36%)" : "hsl(38, 92%, 50%)",
              }}
            />
          </div>
          <p className="mt-1 text-[10px] text-on-surface-muted">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
