"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { alertSeverity, downtimeTrend, queryBreakdown, riskDistribution } from "@/lib/demo-data";

export function RiskDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <BarChart data={riskDistribution}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
        <Bar dataKey="risk" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        <Bar dataKey="reliability" fill="#06B6D4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DowntimeTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart data={downtimeTrend}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
        <Line type="monotone" dataKey="risk" stroke="#8B5CF6" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="downtime" stroke="#06B6D4" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ComplianceGauge({ value = 82 }: { value?: number }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: "score", value, fill: "#22C55E" }]} startAngle={180} endAngle={0}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={12} background fill="#22C55E" />
        <text x="50%" y="58%" textAnchor="middle" fill="#fff" fontSize={38} fontWeight={800}>{value}%</text>
        <text x="50%" y="72%" textAnchor="middle" fill="#94A3B8" fontSize={12}>audit readiness</text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export function SeverityBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={alertSeverity} layout="vertical">
        <XAxis type="number" stroke="#94A3B8" />
        <YAxis type="category" dataKey="severity" stroke="#94A3B8" width={72} />
        <Tooltip contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {alertSeverity.map((entry) => <Cell key={entry.severity} fill={entry.severity === "Critical" ? "#EF4444" : entry.severity === "High" ? "#F59E0B" : entry.severity === "Medium" ? "#3B82F6" : "#22C55E"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function QueryBreakdownChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={queryBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
          {queryBreakdown.map((_, index) => <Cell key={index} fill={["#3B82F6", "#06B6D4", "#8B5CF6", "#22C55E"][index]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#0b1024", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
