"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BeforeAfterSlider({
  before,
  after
}: {
  before?: string;
  after?: string;
}) {
  const [value, setValue] = useState(50);
  const enabled = useMemo(() => Boolean(before && after), [before, after]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Before / After Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">Tablet-friendly image slider for baseline vs follow-up.</p>
        </div>
        <Badge>{enabled ? "Interactive" : "Awaiting second visit"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-[280px] overflow-hidden rounded-[24px] bg-stone-100">
          {before ? <img src={before} alt="Baseline" className="h-full w-full object-cover" /> : null}
          {after ? (
            <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${value}%` }}>
              <img src={after} alt="Follow-up" className="h-full w-[calc(100vw)] max-w-none object-cover" />
            </div>
          ) : null}
          <div
            className="absolute inset-y-0 w-1 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.9)]"
            style={{ left: `calc(${value}% - 2px)` }}
          />
          <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs text-white">Baseline</div>
          <div className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs text-foreground">Latest</div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </CardContent>
    </Card>
  );
}
