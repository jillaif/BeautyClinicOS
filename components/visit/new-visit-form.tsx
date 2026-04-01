"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, Visit } from "@/lib/types";

type SavedVisitResponse = {
  visit: Visit;
  reminderCount: number;
  aiSource: "openai" | "mock";
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function NewVisitForm({
  customers,
  treatmentCatalog
}: {
  customers: Customer[];
  treatmentCatalog: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id ?? "");
  const [treatment, setTreatment] = useState(treatmentCatalog[0] ?? "Hydrafacial");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<{ front?: File; left?: File; right?: File }>({});
  const [uploadError, setUploadError] = useState("");
  const [result, setResult] = useState<SavedVisitResponse | null>(null);

  const customer = useMemo(
    () => customers.find((item) => item.id === selectedCustomer),
    [customers, selectedCustomer]
  );

  const onFileChange = (angle: "front" | "left" | "right", file?: File) => {
    if (!file) {
      setFiles((current) => ({ ...current, [angle]: undefined }));
      setUploadError("");
      return;
    }

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    const isHeic = type.includes("heic") || type.includes("heif") || name.endsWith(".heic") || name.endsWith(".heif");

    if (isHeic) {
      setUploadError("HEIC/HEIF photos are stored but usually will not render in the before/after slider. Please convert them to JPG, PNG, or WebP first.");
      setFiles((current) => ({ ...current, [angle]: undefined }));
      return;
    }

    setUploadError("");
    setFiles((current) => ({ ...current, [angle]: file }));
  };

  const onSubmit = () =>
    startTransition(async () => {
      const photoPayload = await Promise.all(
        (["front", "left", "right"] as const).map(async (angle) => ({
          angle,
          url: files[angle] ? await fileToDataUrl(files[angle]!) : `/demo/${angle}.svg`
        }))
      );

      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer,
          treatmentPerformed: treatment,
          clinicianNotes: notes,
          photos: photoPayload
        })
      });

      const data = (await response.json()) as SavedVisitResponse;
      setResult(data);
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>New Visit Flow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Treatment Performed</Label>
            <Select value={treatment} onValueChange={setTreatment}>
              <SelectTrigger>
                <SelectValue placeholder="Select treatment" />
              </SelectTrigger>
              <SelectContent>
                {treatmentCatalog.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(["front", "left", "right"] as const).map((angle) => (
            <div key={angle} className="space-y-2">
              <Label className="capitalize">{angle} Photo</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onFileChange(angle, event.target.files?.[0])}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <p className="text-xs leading-5 text-muted-foreground">
              Best results: upload JPG, PNG, or WebP images. iPhone HEIC photos often do not render in browser-based comparison sliders.
            </p>
            {uploadError ? <p className="mt-2 text-sm text-destructive">{uploadError}</p> : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Clinician Notes</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Treatment done, visible concerns, plan, homecare notes..."
            />
          </div>
          <Button className="md:col-span-2" disabled={isPending || !selectedCustomer} onClick={onSubmit}>
            Run Analysis & Save Visit
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,242,235,0.98))]">
        <CardHeader>
          <div>
            <CardTitle>Generated Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Prototype output powered by OpenAI when configured, otherwise deterministic mock text.
            </p>
          </div>
          <Badge>{result ? result.aiSource.toUpperCase() : "Awaiting Analysis"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <div className="rounded-[24px] bg-secondary p-4">
                <p className="text-sm leading-6 text-foreground">{result.visit.aiReport.consultation_summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.visit.skinScores).map(([key, value]) => (
                  <div key={key} className="rounded-[22px] bg-white/80 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{key}</div>
                    <div className="mt-2 font-display text-2xl">{value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-[24px] border border-border/60 bg-white/80 p-4">
                <div className="mb-2 text-sm font-medium">Recommended Treatments</div>
                <div className="flex flex-wrap gap-2">
                  {result.visit.aiReport.recommended_treatments.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Auto-created reminders: {result.reminderCount}</p>
                <p>Customer: {customer?.name}</p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/customer/${selectedCustomer}`}>Open Customer Profile</Link>
              </Button>
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-border/80 bg-white/55 p-8 text-sm text-muted-foreground">
              Upload front/left/right photos, add treatment notes, and save the visit to generate scores,
              recommendations, reminder messaging, and customer-friendly consultation copy.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
