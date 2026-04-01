"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Reminder } from "@/lib/types";

export function ReminderActions({
  reminder,
  onRefresh
}: {
  reminder: Reminder;
  onRefresh?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(reminder.dueDate.slice(0, 10));

  const patchReminder = (payload: Partial<Reminder>) => {
    startTransition(async () => {
      await fetch(`/api/reminders/${reminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      onRefresh?.();
      if (!onRefresh) {
        window.location.reload();
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => patchReminder({ status: "completed" })}>
        Mark Completed
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Reschedule
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Reminder</DialogTitle>
            <DialogDescription>Update the next outreach date for this treatment follow-up.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <Button
              className="w-full"
              onClick={() => patchReminder({ dueDate: new Date(`${date}T09:00:00.000Z`).toISOString() })}
            >
              Save New Date
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Send Reminder</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reminder Message</DialogTitle>
            <DialogDescription>Prototype action only. Use this prewritten message for outreach.</DialogDescription>
          </DialogHeader>
          <div className="rounded-3xl bg-secondary p-4 text-sm leading-6 text-foreground">{reminder.message}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
