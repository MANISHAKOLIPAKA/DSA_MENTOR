"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { week: string; solved: number }[];
}

export function ProgressChart({ data }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-4">Problems Solved / Week</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="week"
            stroke="#4b5563"
            tick={{ fill: "#6b7280", fontSize: 11 }}
          />
          <YAxis stroke="#4b5563" tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: 8,
              color: "#f3f4f6",
            }}
            cursor={{ fill: "#1f2937" }}
          />
          <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
