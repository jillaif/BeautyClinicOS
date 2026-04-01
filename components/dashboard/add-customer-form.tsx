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

  return (
    <Card className="bg-white/92">
      <CardHeader>
        <CardTitle>Add Customer</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Customer name" />
        </div>
        <div className="space-y-2">
          <Label>Age</Label>
          <Input value={form.age} onChange={(event) => update("age", event.target.value)} type="number" />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={(value) => update("gender", value)}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label>Skin Type</Label>
          <Select defaultValue={form.skinType} onValueChange={(value) => update("skinType", value)}>
            <SelectTrigger>
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
        <div className="space-y-2 md:col-span-2">
          <Label>Main Concern</Label>
          <Input
            value={form.mainConcern}
            onChange={(event) => update("mainConcern", event.target.value)}
            placeholder="Acne, pigmentation, anti-aging..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} />
        </div>
        <Button
          className="md:col-span-2"
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
