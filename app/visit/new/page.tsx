import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { NewVisitForm } from "@/components/visit/new-visit-form";
import { Button } from "@/components/ui/button";
import { getClinicData } from "@/lib/data";

export default async function NewVisitPage() {
  const data = await getClinicData();

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h2 className="font-display text-5xl leading-none">Create Follow-Up Visit</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Upload three facial angles, log treatment details, generate the AI-assisted report, and automatically create future follow-up reminders.
        </p>
      </div>
      <NewVisitForm customers={data.customers} treatmentCatalog={data.treatmentCatalog} />
    </div>
  );
}
