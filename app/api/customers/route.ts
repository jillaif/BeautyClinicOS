import { NextResponse } from "next/server";

import { createCustomer, listCustomers } from "@/lib/data";
import type { Customer } from "@/lib/types";

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const customer: Customer = {
    id: `cust-${crypto.randomUUID()}`,
    name: body.name,
    age: Number(body.age),
    gender: body.gender,
    skinType: body.skinType,
    mainConcern: body.mainConcern,
    notes: body.notes ?? "",
    createdAt: new Date().toISOString()
  };

  const saved = await createCustomer(customer);
  return NextResponse.json(saved, { status: 201 });
}
