import { NextResponse } from "next/server";

import { getClinicData, getDashboardStats } from "@/lib/data";

export async function GET() {
  const [stats, data] = await Promise.all([getDashboardStats(), getClinicData()]);
  return NextResponse.json({ stats, customers: data.customers, reminders: data.reminders });
}
