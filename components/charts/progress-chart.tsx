"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ProgressDatum = {
  label: string;
  overallScore: number;
  hydrationScore: number;
  acneScore: number;
  pigmentationScore: number;
  wrinkleScore: number;
};

export function ProgressChart({ data }: { data: ProgressDatum[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="rgba(85,124,138,0.12)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6E655F", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#6E655F", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.8)",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 20px 45px rgba(30, 26, 22, 0.08)"
            }}
          />
          <Line type="monotone" dataKey="overallScore" stroke="#557C8A" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="hydrationScore" stroke="#88AFA3" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="pigmentationScore" stroke="#D8B08C" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="acneScore" stroke="#D96F5D" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="wrinkleScore" stroke="#C9A66B" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
