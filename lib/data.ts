import { promises as fs } from "fs";
import path from "path";
import { format, isThisMonth, parseISO } from "date-fns";
import postgres from "postgres";

import type {
  ClinicData,
  Customer,
  CustomerDetail,
  DashboardStats,
  Reminder,
  ReminderStatus,
  Visit
} from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), "data", "clinic.json");
const CLINIC_STATE_ID = "default";

let sqlClient: postgres.Sql | null = null;
let dbReady: Promise<void> | null = null;

function isPostgresEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: "require",
      prepare: false
    });
  }

  return sqlClient;
}

async function readLocalFile() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as ClinicData;
}

async function writeLocalFile(data: ClinicData) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function ensureDatabase() {
  if (!isPostgresEnabled()) {
    return;
  }

  if (!dbReady) {
    dbReady = (async () => {
      const sql = getSql();

      await sql`
        create table if not exists clinic_state (
          id text primary key,
          payload jsonb not null,
          updated_at timestamptz not null default now()
        )
      `;

      const existing = await sql<{ id: string }[]>`
        select id
        from clinic_state
        where id = ${CLINIC_STATE_ID}
        limit 1
      `;

      if (existing.length === 0) {
        const seed = await readLocalFile();
        await sql`
          insert into clinic_state (id, payload)
          values (${CLINIC_STATE_ID}, ${sql.json(seed)})
        `;
      }
    })();
  }

  await dbReady;
}

async function readClinicData() {
  if (!isPostgresEnabled()) {
    return readLocalFile();
  }

  await ensureDatabase();
  const sql = getSql();
  const rows = await sql<{ payload: ClinicData }[]>`
    select payload
    from clinic_state
    where id = ${CLINIC_STATE_ID}
    limit 1
  `;

  const payload = rows[0]?.payload;
  if (!payload) {
    throw new Error("Clinic state row is missing");
  }

  return payload;
}

async function writeClinicData(data: ClinicData) {
  if (!isPostgresEnabled()) {
    await writeLocalFile(data);
    return;
  }

  await ensureDatabase();
  const sql = getSql();
  await sql`
    insert into clinic_state (id, payload, updated_at)
    values (${CLINIC_STATE_ID}, ${sql.json(data)}, now())
    on conflict (id)
    do update set
      payload = excluded.payload,
      updated_at = now()
  `;
}

export async function getClinicData() {
  return readClinicData();
}

export async function saveClinicData(data: ClinicData) {
  await writeClinicData(data);
}

export async function listCustomers() {
  const data = await readClinicData();
  return data.customers;
}

export async function createCustomer(customer: Customer) {
  const data = await readClinicData();
  data.customers.unshift(customer);
  await writeClinicData(data);
  return customer;
}

export async function addVisit(visit: Visit, reminders: Reminder[]) {
  const data = await readClinicData();
  data.visits.unshift(visit);
  data.reminders.unshift(...reminders);
  await writeClinicData(data);
  return visit;
}

export async function updateReminder(
  reminderId: string,
  updates: Partial<Pick<Reminder, "status" | "dueDate" | "message">>
) {
  const data = await readClinicData();
  const reminder = data.reminders.find((item) => item.id === reminderId);
  if (!reminder) {
    return null;
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      Object.assign(reminder, { [key]: value });
    }
  });
  await writeClinicData(data);
  return reminder;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await readClinicData();
  const improvedCustomers = await Promise.all(
    data.customers.map(async (customer) => {
      const detail = await getCustomerDetail(customer.id);
      return detail?.avgImprovement ?? 0;
    })
  );

  return {
    totalCustomers: data.customers.length,
    visitsThisMonth: data.visits.filter((visit) => isThisMonth(parseISO(visit.visitDate))).length,
    avgImprovement:
      improvedCustomers.length > 0
        ? improvedCustomers.reduce((sum, value) => sum + value, 0) / improvedCustomers.length
        : 0,
    upcomingFollowUps: data.reminders.filter((reminder) => reminder.status !== "completed").length
  };
}

export async function getCustomerDetail(customerId: string): Promise<CustomerDetail | null> {
  const data = await readClinicData();
  const customer = data.customers.find((item) => item.id === customerId);

  if (!customer) {
    return null;
  }

  const visits = data.visits
    .filter((item) => item.customerId === customerId)
    .sort((a, b) => +new Date(a.visitDate) - +new Date(b.visitDate));
  const reminders = data.reminders
    .filter((item) => item.customerId === customerId)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const baselineVisit = visits[0];
  const latestVisit = visits.at(-1);
  const avgImprovement = calculateAverageImprovement(baselineVisit, latestVisit);
  const progressSummary =
    latestVisit?.aiReport.customer_summary ??
    "AI-assisted analysis, not a medical diagnosis. For clinician review.";

  return {
    ...customer,
    visits,
    reminders,
    latestVisit,
    baselineVisit,
    avgImprovement,
    progressSummary
  };
}

function calculateAverageImprovement(baseline?: Visit, latest?: Visit) {
  if (!baseline || !latest || baseline.id === latest.id) {
    return 0;
  }

  const lowerIsBetterKeys: Array<keyof Visit["skinScores"]> = [
    "acneScore",
    "pigmentationScore",
    "wrinkleScore",
    "poreScore",
    "rednessScore",
    "skinAgeEstimate"
  ];
  const higherIsBetterKeys: Array<keyof Visit["skinScores"]> = [
    "hydrationScore",
    "firmnessScore",
    "overallScore"
  ];

  const improvements = [
    ...lowerIsBetterKeys.map((key) => {
      const start = baseline.skinScores[key];
      const end = latest.skinScores[key];
      return ((start - end) / Math.max(start, 1)) * 100;
    }),
    ...higherIsBetterKeys.map((key) => {
      const start = baseline.skinScores[key];
      const end = latest.skinScores[key];
      return ((end - start) / Math.max(start, 1)) * 100;
    })
  ];

  return improvements.reduce((sum, value) => sum + value, 0) / improvements.length;
}

export function deriveReminderStatus(dueDate: string): ReminderStatus {
  const now = new Date();
  const due = parseISO(dueDate);
  const diffDays = (+due - +now) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return "overdue";
  }
  if (diffDays <= 14) {
    return "due_soon";
  }
  return "upcoming";
}

export function formatVisitLabel(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
}
