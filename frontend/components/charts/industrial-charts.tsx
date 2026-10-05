"use client";

import { Bar, BarChart, Legend, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { alertSeverity, downtimeTrend, queryBreakdown, riskDistribution } from "@/lib/demo-data";

export function RiskDistributionChart({ light = false }: { light?: boolean } = {}) {
  const theme = palette(light);
  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart data={riskDistribution} margin={{ top: 12, right: 8, bottom: 4, left: -24 }} accessibilityLayer>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke={theme.muted} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.muted} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 12, fontSize: 15 }} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 14, paddingTop: 12 }} />
        <Bar name="Risk score" dataKey="risk" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        <Bar name="Reliability" dataKey="reliability" fill="#06B6D4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DowntimeTrendChart({ light = false }: { light?: boolean } = {}) {
  const theme = palette(light);
  return (
    <ResponsiveContainer width="100%" height={290}>
      <LineChart data={downtimeTrend} margin={{ top: 12, right: 8, bottom: 4, left: -24 }} accessibilityLayer>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke={theme.muted} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.muted} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 12, fontSize: 15 }} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 14, paddingTop: 12 }} />
        <Line name="Risk" type="monotone" dataKey="risk" stroke="#8B5CF6" strokeWidth={3} dot={false} />
        <Line name="Downtime" type="monotone" dataKey="downtime" stroke="#06B6D4" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ComplianceGauge({ value = 82, light = false }: { value?: number; light?: boolean }) {
  const theme = palette(light);
  return (
    <ResponsiveContainer width="100%" height={270}>
      <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "score", value, fill: "#22C55E" }]} startAngle={180} endAngle={0}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={12} background fill="#22C55E" />
        <text x="50%" y="58%" textAnchor="middle" fill={theme.text} fontSize={40} fontWeight={800}>{value}%</text>
        <text x="50%" y="72%" textAnchor="middle" fill={theme.muted} fontSize={15}>audit readiness</text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export function SeverityBarChart({ light = false }: { light?: boolean } = {}) {
  const theme = palette(light);
  return (
    <ResponsiveContainer width="100%" height={270}>
      <BarChart data={alertSeverity} layout="vertical" margin={{ left: 6, right: 14 }} accessibilityLayer>
        <XAxis type="number" stroke={theme.muted} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="severity" stroke={theme.muted} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} width={72} />
        <Tooltip contentStyle={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 12, fontSize: 15 }} />
        <Bar name="Alerts" dataKey="count" radius={[0, 8, 8, 0]}>
          {alertSeverity.map((entry) => <Cell key={entry.severity} fill={entry.severity === "Critical" ? "#EF4444" : entry.severity === "High" ? "#F59E0B" : entry.severity === "Medium" ? "#3B82F6" : "#22C55E"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function QueryBreakdownChart({ light = false }: { light?: boolean } = {}) {
  const theme = palette(light);
  return (
    <ResponsiveContainer width="100%" height={270}>
      <PieChart>
        <Pie data={queryBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
          {queryBreakdown.map((_, index) => <Cell key={index} fill={["#3B82F6", "#06B6D4", "#8B5CF6", "#22C55E"][index]} />)}
        </Pie>
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 14 }} />
        <Tooltip contentStyle={{ background: theme.surface, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 12, fontSize: 15 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function palette(light: boolean) {
  return light ? { grid: "#e3e9f0", muted: "#5a677c", text: "#172b46", surface: "#ffffff" } : { grid: "rgba(255,255,255,0.08)", muted: "#94a3b8", text: "#ffffff", surface: "#0b1024" };
}
