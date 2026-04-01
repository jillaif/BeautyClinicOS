"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddCustomerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    age: "30",
    gender: "Female",
    skinType: "Combination",
    mainConcern: "",
    notes: ""
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const fieldClassName = "h-14 rounded-[28px] px-5 text-[15px]";

  return (
    <Card className="bg-white/92">
      <CardHeader>
        <CardTitle>Add Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-7">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid content-start gap-3">
            <Label className="min-h-7 text-base leading-none">Name</Label>
            <Input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Customer name"
              className={fieldClassName}
            />
          </div>
          <div className="grid content-start gap-3">
            <Label className="min-h-7 text-base leading-none">Age</Label>
            <Input
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
              type="number"
              inputMode="numeric"
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid content-start gap-3">
            <Label className="min-h-7 text-base leading-none">Gender</Label>
            <Select value={form.gender} onValueChange={(value) => update("gender", value)}>
              <SelectTrigger className={fieldClassName}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid content-start gap-3">
            <Label className="min-h-7 text-base leading-none">Skin Type</Label>
            <Select value={form.skinType} onValueChange={(value) => update("skinType", value)}>
              <SelectTrigger className={fieldClassName}>
                <SelectValue placeholder="Select skin type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Oily">Oily</SelectItem>
                <SelectItem value="Dry">Dry</SelectItem>
                <SelectItem value="Combination">Combination</SelectItem>
                <SelectItem value="Sensitive">Sensitive</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <Label className="min-h-7 text-base leading-none">Main Concern</Label>
          <Input
            value={form.mainConcern}
            onChange={(event) => update("mainConcern", event.target.value)}
            placeholder="Acne, pigmentation, anti-aging..."
            className={fieldClassName}
          />
        </div>

        <div className="grid content-start gap-3">
          <Label className="min-h-7 text-base leading-none">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            className="min-h-[200px] rounded-[30px]"
          />
        </div>
        <Button
          className="mt-1 h-14 w-full"
          disabled={isPending || !form.name || !form.mainConcern}
          onClick={() =>
            startTransition(async () => {
              await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...form,
                  age: Number(form.age)
                })
              });
              setForm({
                name: "",
                age: "30",
                gender: "Female",
                skinType: "Combination",
                mainConcern: "",
                notes: ""
              });
              router.refresh();
            })
          }
        >
          Create Customer
        </Button>
      </CardContent>
    </Card>
  );
}
