import { NextResponse } from "next/server";

import { generateMockSkinScores, ruleBasedTreatments } from "@/lib/analysis";
import { addVisit, getClinicData, getCustomerDetail } from "@/lib/data";
import { generateOpenAIInsights } from "@/lib/openai";
import { createRemindersForTreatment } from "@/lib/reminders";
import type { Photo, Visit } from "@/lib/types";

function buildChangeSummary(customerDetail: Awaited<ReturnType<typeof getCustomerDetail>>, overallScore: number) {
  const previous = customerDetail?.latestVisit;
  if (!previous) {
    return "This is the baseline scan, so future visits will unlock before-and-after progress tracking.";
  }

  const delta = overallScore - previous.skinScores.overallScore;
  if (delta > 0) {
    return `Compared with the last visit, the overall skin score improved by ${delta} points.`;
  }
  if (delta < 0) {
    return `Compared with the last visit, the overall skin score decreased by ${Math.abs(delta)} points and should be reviewed clinically.`;
  }
  return "Overall score is stable compared with the last visit.";
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = await getClinicData();
  const customer = data.customers.find((item) => item.id === body.customerId);

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const existingVisits = data.visits
    .filter((visit) => visit.customerId === customer.id)
    .sort((a, b) => +new Date(a.visitDate) - +new Date(b.visitDate));

  const scores = generateMockSkinScores({
    age: customer.age,
    skinType: customer.skinType,
    mainConcern: customer.mainConcern,
    treatmentHistory: existingVisits.map((item) => item.treatmentPerformed),
    clinicTreatmentCatalog: data.treatmentCatalog,
    photos: body.photos,
    notes: body.clinicianNotes ?? ""
  });

  const detail = await getCustomerDetail(customer.id);
  const ai = await generateOpenAIInsights({
    customerName: customer.name,
    age: customer.age,
    skinType: customer.skinType,
    mainConcern: customer.mainConcern,
    treatmentHistory: existingVisits.map((item) => item.treatmentPerformed),
    clinicTreatmentCatalog: data.treatmentCatalog,
    scores,
    changeSummary: buildChangeSummary(detail, scores.overallScore)
  });

  const visitId = `visit-${crypto.randomUUID()}`;
  const photos: Photo[] = (body.photos as Array<{ angle: "front" | "left" | "right"; url: string }>).map(
    (photo) => ({
      id: `photo-${crypto.randomUUID()}`,
      visitId,
      angle: photo.angle,
      url: photo.url
    })
  );

  const visit: Visit = {
    id: visitId,
    customerId: customer.id,
    visitDate: new Date().toISOString(),
    treatmentPerformed: body.treatmentPerformed,
    clinicianNotes: body.clinicianNotes ?? "",
    aiReport: {
      ...ai.data,
      recommended_treatments:
        ai.data.recommended_treatments.length > 0 ? ai.data.recommended_treatments : ruleBasedTreatments(scores)
    },
    skinScores: scores,
    photos
  };

  const reminders = createRemindersForTreatment({
    customerId: customer.id,
    visitId,
    visitDate: visit.visitDate,
    treatmentType: visit.treatmentPerformed,
    message: visit.aiReport.reminder_message
  });

  await addVisit(visit, reminders);

  return NextResponse.json({
    visit,
    reminderCount: reminders.length,
    aiSource: ai.source
  });
}
