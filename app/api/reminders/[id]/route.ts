import { NextResponse } from "next/server";

import { deriveReminderStatus, updateReminder } from "@/lib/data";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const computedStatus = body.status ?? (body.dueDate ? deriveReminderStatus(body.dueDate) : undefined);
  const reminder = await updateReminder(id, {
    status: computedStatus,
    dueDate: body.dueDate,
    message: body.message
  });

  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }
  return NextResponse.json(reminder);
}
