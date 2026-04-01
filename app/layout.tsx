import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { CalendarClock, LayoutDashboard, PlusSquare } from "lucide-react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Beauty Clinic OS",
  description: "Tablet-friendly beauty clinic MVP with AI-assisted skin analysis and follow-up workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-4 lg:px-6">
          <div className="grid min-h-[calc(100vh-2rem)] grid-cols-1 gap-4 lg:grid-cols-[250px,1fr]">
            <aside className="rounded-[32px] border border-white/70 bg-white/76 p-5 shadow-soft backdrop-blur">
              <div className="mb-10">
                <h1 className="font-display text-4xl leading-none text-foreground">Beauty Clinic OS</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  AI-assisted analysis, not a medical diagnosis. For clinician review.
                </p>
              </div>
              <nav className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  Dashboard
                </Link>
                <Link
                  href="/visit/new"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  <PlusSquare className="h-4 w-4 text-primary" />
                  New Visit
                </Link>
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground/75">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Reminder Workflow
                </div>
              </nav>
              <div className="mt-10 rounded-[28px] bg-[linear-gradient(135deg,rgba(216,176,140,0.14),rgba(136,175,163,0.16))] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">iPad Focus</div>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Landscape-first layout with large touch targets, concise cards, and visual comparison tools for consultations.
                </p>
              </div>
            </aside>
            <main className="overflow-hidden rounded-[32px] border border-white/60 bg-white/30 p-4 shadow-glow backdrop-blur lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
