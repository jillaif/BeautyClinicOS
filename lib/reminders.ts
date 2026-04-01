import { addMonths, addWeeks, formatISO } from "date-fns";

import { deriveReminderStatus } from "@/lib/data";
import type { Reminder, ReminderType } from "@/lib/types";

export function createRemindersForTreatment(params: {
  customerId: string;
  visitId: string;
  visitDate: string;
  treatmentType: string;
  message: string;
}) {
  const treatment = params.treatmentType.toLowerCase();
  const visitDate = new Date(params.visitDate);

  let dueDate = addWeeks(visitDate, 4);
  let reminderType: ReminderType = "client_follow_up";
  let assignedTo = "Front Desk";

  if (treatment.includes("rf") || treatment.includes("電波")) {
    dueDate = addMonths(visitDate, 6);
    reminderType = "doctor_check_in";
    assignedTo = "Medical Director";
  } else if (treatment.includes("pico")) {
    dueDate = addWeeks(visitDate, 8);
    reminderType = "staff_outreach";
    assignedTo = "Laser Team";
  } else if (treatment.includes("botox")) {
    dueDate = addWeeks(visitDate, 14);
    reminderType = "doctor_check_in";
    assignedTo = "Injectables Nurse";
  } else if (treatment.includes("hydrafacial")) {
    dueDate = addWeeks(visitDate, 4);
    reminderType = "client_follow_up";
    assignedTo = "Skin Concierge";
  }

  const dueDateIso = formatISO(dueDate);

  const reminder: Reminder = {
    id: `reminder-${params.visitId}`,
    customerId: params.customerId,
    visitId: params.visitId,
    treatmentType: params.treatmentType,
    reminderType,
    dueDate: dueDateIso,
    status: deriveReminderStatus(dueDateIso),
    message: params.message,
    assignedTo
  };

  return [reminder];
}
