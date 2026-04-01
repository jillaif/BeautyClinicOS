"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TimelineVisit = {
  id: string;
  label: string;
  treatmentPerformed: string;
  notes: string;
  overallScore: number;
  imageUrl?: string;
};

export function PhotoProgressTimeline({ visits }: { visits: TimelineVisit[] }) {
  const [activeIndex, setActiveIndex] = useState(visits.length > 0 ? visits.length - 1 : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [brokenIds, setBrokenIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveIndex(visits.length > 0 ? visits.length - 1 : 0);
  }, [visits.length]);

  useEffect(() => {
    if (!isPlaying || visits.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visits.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, [isPlaying, visits.length]);

  const activeVisit = visits[activeIndex];
  const usableVisits = useMemo(() => visits.filter((visit) => Boolean(visit.imageUrl)), [visits]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Photo Progress Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Every visit is preserved in sequence so clinics can show visual progress over time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{visits.length} visit(s)</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPlaying((current) => !current)}
            disabled={usableVisits.length <= 1}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="overflow-hidden rounded-[28px] bg-stone-100">
            {activeVisit?.imageUrl && !brokenIds.includes(activeVisit.id) ? (
              <img
                key={activeVisit.id}
                src={activeVisit.imageUrl}
                alt={`${activeVisit.label} progress`}
                className="h-[420px] w-full object-cover transition duration-500"
                onError={() =>
                  setBrokenIds((current) =>
                    current.includes(activeVisit.id) ? current : [...current, activeVisit.id]
                  )
                }
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-secondary/70 p-8 text-center text-sm leading-6 text-muted-foreground">
                This visit photo could not be rendered in the browser. JPG, PNG, or WebP work best for the timeline.
              </div>
            )}
          </div>
          <div className="rounded-[28px] bg-secondary/65 p-5">
            {activeVisit ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selected Visit</div>
                  <div className="mt-2 font-display text-4xl">{activeVisit.label}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white/75 p-4">
                    <div className="text-sm text-muted-foreground">Treatment</div>
                    <div className="mt-2 font-medium text-foreground">{activeVisit.treatmentPerformed}</div>
                  </div>
                  <div className="rounded-[22px] bg-white/75 p-4">
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <div className="mt-2 font-display text-3xl text-foreground">{activeVisit.overallScore}</div>
                  </div>
                </div>
                <div className="rounded-[22px] border border-white/80 bg-white/75 p-4 text-sm leading-6 text-foreground">
                  {activeVisit.notes || "No clinician note was added for this visit."}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Use the timeline below to jump between visits, or press play to animate the progress sequence during consultation.
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Add a visit to start building the photo progress history.</div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-start gap-4">
            {visits.map((visit, index) => {
              const isActive = index === activeIndex;
              const imageBroken = brokenIds.includes(visit.id);

              return (
                <button
                  key={visit.id}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveIndex(index);
                  }}
                  className={cn(
                    "group w-[220px] rounded-[24px] border p-3 text-left transition",
                    isActive
                      ? "border-primary/60 bg-white shadow-soft"
                      : "border-white/80 bg-white/75 hover:-translate-y-0.5 hover:shadow-soft"
                  )}
                >
                  <div className="mb-3 overflow-hidden rounded-[18px] bg-stone-100">
                    {visit.imageUrl && !imageBroken ? (
                      <img
                        src={visit.imageUrl}
                        alt={`${visit.label} thumbnail`}
                        className="h-[120px] w-full object-cover"
                        onError={() =>
                          setBrokenIds((current) => (current.includes(visit.id) ? current : [...current, visit.id]))
                        }
                      />
                    ) : (
                      <div className="flex h-[120px] items-center justify-center px-4 text-center text-xs leading-5 text-muted-foreground">
                        Photo unavailable
                      </div>
                    )}
                  </div>
                  <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Visit {index + 1}
                  </div>
                  <div className="font-medium text-foreground">{visit.label}</div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{visit.treatmentPerformed}</div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
