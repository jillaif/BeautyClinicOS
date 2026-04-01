import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ChevronLeft, Sparkles } from "lucide-react";

import { ProgressChart } from "@/components/charts/progress-chart";
import { PhotoProgressTimeline } from "@/components/profile/photo-progress-timeline";
import { ReminderActions } from "@/components/profile/reminder-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerDetail } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

function metricChange(start: number, end: number, higherIsBetter = false) {
  if (start === end) return "0.0%";
  const value = higherIsBetter ? ((end - start) / Math.max(start, 1)) * 100 : ((start - end) / Math.max(start, 1)) * 100;
  return formatPercent(value);
}

function reminderTone(status: string) {
  if (status === "overdue") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "due_soon") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-sky-50 text-sky-700 border-sky-200";
}

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);

  if (!customer) {
    notFound();
  }

  const baseline = customer.baselineVisit;
  const latest = customer.latestVisit;
  const hasFollowUp = Boolean(baseline && latest && baseline.id !== latest.id);
  const progressData = customer.visits.map((visit, index) => ({
    label: `V${index + 1}`,
    overallScore: visit.skinScores.overallScore,
    hydrationScore: visit.skinScores.hydrationScore,
    acneScore: visit.skinScores.acneScore,
    pigmentationScore: visit.skinScores.pigmentationScore,
    wrinkleScore: visit.skinScores.wrinkleScore
  }));
  const timelineVisits = customer.visits.map((visit) => ({
    id: visit.id,
    label: new Date(visit.visitDate).toLocaleDateString(),
    treatmentPerformed: visit.treatmentPerformed,
    notes: visit.clinicianNotes,
    overallScore: visit.skinScores.overallScore,
    imageUrl: visit.photos.find((photo) => photo.angle === "front")?.url
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-3 -ml-3">
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-5xl leading-none">{customer.name}</h2>
            <Badge>{customer.skinType} skin</Badge>
            <Badge>{customer.mainConcern}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {customer.age} years old · {customer.gender}. {customer.notes}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/visit/new">Add Second Visit / Follow-Up</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Latest Overall</div>
            <div className="mt-2 font-display text-4xl">{latest?.skinScores.overallScore ?? "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Average Improvement</div>
            <div className="mt-2 font-display text-4xl">{formatPercent(customer.avgImprovement)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Visit Timeline</div>
            <div className="mt-2 font-display text-4xl">{customer.visits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Active Reminders</div>
            <div className="mt-2 font-display text-4xl">
              {customer.reminders.filter((item) => item.status !== "completed").length}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="bg-white/92">
          <CardHeader>
            <div>
              <CardTitle>Progress Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Baseline vs latest scores with AI-friendly progress framing for consultations.
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <ProgressChart data={progressData} />
            <div className="mt-5 rounded-[24px] bg-secondary p-4 text-sm leading-6 text-foreground">
              {latest?.aiReport.customer_summary}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/92">
          <CardHeader>
            <div>
              <CardTitle>Score Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">Prototype metrics, deterministic and consistent for demo playback.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {hasFollowUp && baseline && latest
              ? [
                  ["Acne", baseline.skinScores.acneScore, latest.skinScores.acneScore, false],
                  ["Pigmentation", baseline.skinScores.pigmentationScore, latest.skinScores.pigmentationScore, false],
                  ["Wrinkles", baseline.skinScores.wrinkleScore, latest.skinScores.wrinkleScore, false],
                  ["Hydration", baseline.skinScores.hydrationScore, latest.skinScores.hydrationScore, true],
                  ["Firmness", baseline.skinScores.firmnessScore, latest.skinScores.firmnessScore, true],
                  ["Overall", baseline.skinScores.overallScore, latest.skinScores.overallScore, true]
                ].map(([label, start, end, higherIsBetter]) => (
                  <div key={String(label)} className="rounded-[22px] bg-secondary/70 p-4">
                    <div className="text-sm text-muted-foreground">{String(label)}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {String(start)} → {String(end)}
                    </div>
                    <div className="mt-2 font-display text-3xl">{metricChange(Number(start), Number(end), Boolean(higherIsBetter))}</div>
                  </div>
                ))
              : (
                <div className="rounded-[22px] bg-secondary/70 p-4 text-sm text-muted-foreground">
                  Add a follow-up visit to unlock comparison metrics and trend lines.
                </div>
              )}
          </CardContent>
        </Card>
      </section>

      <PhotoProgressTimeline visits={timelineVisits} />

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="bg-white/92">
          <CardHeader>
            <div>
              <CardTitle>Latest Recommendations</CardTitle>
              <p className="text-sm text-muted-foreground">Treatment plan, products, and consultation summary.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] bg-secondary p-4 text-sm leading-6">{latest?.aiReport.consultation_summary}</div>
            <div>
              <div className="mb-2 text-sm font-medium">Recommended Treatments</div>
              <div className="flex flex-wrap gap-2">
                {latest?.aiReport.recommended_treatments.map((item) => <Badge key={item}>{item}</Badge>)}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Recommended Products</div>
              <div className="flex flex-wrap gap-2">
                {latest?.aiReport.recommended_products.map((item) => <Badge key={item}>{item}</Badge>)}
              </div>
            </div>
            <div className="rounded-[22px] border border-border/70 bg-white/80 p-4 text-sm leading-6">
              <div className="mb-2 text-sm font-medium">Staff Consultation Notes</div>
              {latest?.aiReport.staff_notes}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/92">
          <CardHeader>
            <div>
              <CardTitle>Upcoming Reminders / Follow-Ups</CardTitle>
              <p className="text-sm text-muted-foreground">Client follow-up, staff outreach, and clinician check-in actions.</p>
            </div>
            <CalendarClock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.reminders.length ? (
              customer.reminders.map((reminder) => (
                <div key={reminder.id} className="rounded-[24px] border border-white/80 bg-white/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{reminder.treatmentType}</div>
                      <div className="text-sm text-muted-foreground">
                        {reminder.reminderType.replaceAll("_", " ")} · assigned to {reminder.assignedTo}
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${reminderTone(reminder.status)}`}>
                      {reminder.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">{reminder.message}</p>
                  <div className="mt-3 text-sm text-muted-foreground">
                    Due {new Date(reminder.dueDate).toLocaleDateString()}
                  </div>
                  <div className="mt-4">
                    <ReminderActions reminder={reminder} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-border/80 bg-white/60 p-6 text-sm text-muted-foreground">
                No reminders yet. Saving a treatment visit will auto-generate follow-up reminders based on the treatment type.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Visit Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {customer.visits
            .slice()
            .reverse()
            .map((visit, index) => (
              <div key={visit.id} className="grid gap-4 rounded-[26px] border border-white/80 bg-white/80 p-4 md:grid-cols-[auto,1fr,auto]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary font-medium">{customer.visits.length - index}</div>
                <div>
                  <div className="font-medium">{visit.treatmentPerformed}</div>
                  <div className="text-sm text-muted-foreground">{new Date(visit.visitDate).toLocaleDateString()}</div>
                  <p className="mt-2 text-sm leading-6 text-foreground">{visit.clinicianNotes}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visit.aiReport.top_concerns.map((concern) => (
                    <Badge key={concern}>{concern}</Badge>
                  ))}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
