import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";

import { AddCustomerForm } from "@/components/dashboard/add-customer-form";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClinicData, getDashboardStats } from "@/lib/data";
import { formatPercent } from "@/lib/utils";

function statusTone(status: string) {
  if (status === "overdue") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "due_soon") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-sky-50 text-sky-700 border-sky-200";
}

export default async function DashboardPage() {
  const [stats, data] = await Promise.all([getDashboardStats(), getClinicData()]);
  const reminders = [...data.reminders].sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[32px] bg-hero-glow p-6 shadow-soft">
          <h2 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] text-foreground">
            Luxury clinic workflow for skin analysis, treatment planning, and follow-up growth.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Create clients, upload facial photos, generate AI-assisted reports, compare progress across visits,
            and trigger future reminders automatically from treatment type.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/visit/new">
                Start New Visit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/customer/cust-acne">Open Demo Customer</Link>
            </Button>
          </div>
        </div>
        <AddCustomerForm />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Customers" value={String(stats.totalCustomers)} helper="Active prototype customer records" />
        <StatCard label="Visits This Month" value={String(stats.visitsThisMonth)} helper="Captured in local JSON demo store" />
        <StatCard label="Avg Improvement" value={formatPercent(stats.avgImprovement)} helper="Across customers with follow-up visits" />
        <StatCard label="Upcoming Follow-Ups" value={String(stats.upcomingFollowUps)} helper="Upcoming, due soon, and overdue reminders" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,0.92fr]">
        <Card className="bg-white/92">
          <CardHeader>
            <div>
              <CardTitle>Customer List</CardTitle>
              <p className="text-sm text-muted-foreground">Tap into a profile to review timeline, charts, and reminders.</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.customers.map((customer) => {
              const visits = data.visits.filter((visit) => visit.customerId === customer.id);
              const latest = [...visits].sort((a, b) => +new Date(b.visitDate) - +new Date(a.visitDate))[0];

              return (
                <Link
                  key={customer.id}
                  href={`/customer/${customer.id}`}
                  className="grid items-center gap-4 rounded-[26px] border border-white/80 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-soft md:grid-cols-[1fr,auto,auto]"
                >
                  <div>
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.age} years old · {customer.skinType} skin · {customer.mainConcern}
                    </div>
                  </div>
                  <Badge>{visits.length} visit(s)</Badge>
                  <div className="text-sm text-muted-foreground">Latest: {latest ? new Date(latest.visitDate).toLocaleDateString() : "No visits yet"}</div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-white/92">
          <CardHeader>
            <div>
              <CardTitle>Reminder Queue</CardTitle>
              <p className="text-sm text-muted-foreground">Automated from treatment type, ready for outreach workflows.</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.map((reminder) => {
              const customer = data.customers.find((item) => item.id === reminder.customerId);
              return (
                <div key={reminder.id} className="rounded-[26px] border border-white/70 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{customer?.name}</div>
                      <div className="text-sm text-muted-foreground">{reminder.treatmentType}</div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone(reminder.status)}`}>
                      {reminder.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    Due {new Date(reminder.dueDate).toLocaleDateString()}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">{reminder.message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
