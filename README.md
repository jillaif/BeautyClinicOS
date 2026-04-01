# Beauty Clinic OS

Tablet-friendly MVP web app for a premium beauty clinic workflow:

1. Create or select a customer
2. Upload front/left/right facial photos
3. Generate an AI-assisted skin report
4. Recommend treatments and products
5. Add a later follow-up visit
6. Compare baseline vs latest progress over time
7. Generate consultation-ready summaries
8. Auto-create future follow-up reminders from treatment type

All AI-facing and customer-facing outputs include:

`AI-assisted analysis, not a medical diagnosis. For clinician review.`

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Recharts
- Postgres persistence when `DATABASE_URL` is configured, with local JSON fallback
- Next.js API routes
- OpenAI wrapper with mock fallback

## Setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Copy env file:

```bash
cp .env.example .env.local
```

4. Add env vars:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
DATABASE_URL=your_postgres_connection_string
```

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

If `OPENAI_API_KEY` is missing, the app falls back to deterministic mock copy so the demo still works.

If `DATABASE_URL` is missing, the app stores data locally in `data/clinic.json`.
If `DATABASE_URL` is present, the app stores all customer, visit, and reminder state in Postgres and seeds the database from `data/clinic.json` the first time it boots.

## Demo Flow

1. Open the dashboard.
2. Review the seeded customers:
   - Acne case with 2 visits
   - Pigmentation case with 2 visits
   - Anti-aging case with 1 visit and upcoming reminder
3. Open any customer profile to see:
   - visit timeline
   - latest scores
   - progress chart
   - photo progress timeline
   - recommended treatments/products
   - reminder cards with actions
4. Go to `/visit/new`.
5. Select a customer, upload photos, enter treatment and notes.
6. Click `Run Analysis & Save Visit`.
7. Review the generated report, then open the customer profile.
8. Confirm a reminder was auto-created from the treatment type.

## Reminder Rules

- `RF tightening treatment` / `電波` -> 6 months
- `Pico laser` -> about 2 months
- `Botox` -> about 3.5 months
- `Hydrafacial` -> 1 month
- Any other treatment -> 4 weeks default

Reminder statuses:

- `upcoming`
- `due_soon`
- `overdue`
- `completed`

Prototype actions:

- `Mark Completed`
- `Reschedule`
- `Send Reminder` opens a modal with prewritten text

## Data Model

Stored locally in [`data/clinic.json`](/Users/jillshih/Documents/Playground/data/clinic.json)

- `Customer`
- `Visit`
- `Photo`
- `SkinScores`
- `Reminder`

For deployment, the same payload is stored as JSON in a Postgres table named `clinic_state`.

## OpenAI Output Shape

The OpenAI wrapper returns strict JSON:

```json
{
  "consultation_summary": "",
  "customer_summary": "",
  "top_concerns": [],
  "recommended_treatments": [],
  "recommended_products": [],
  "follow_up_recommendation": "",
  "staff_notes": "",
  "reminder_message": ""
}
```

## Notes

- Skin scoring is deterministic mock logic, so the same input produces the same score.
- This is a prototype only and not a medical device.
- Data persistence falls back to local JSON for easy demo setup and iteration.

## Deploy To Vercel

1. Push this project to GitHub.
2. Create a hosted Postgres database.
   - Vercel Postgres, Neon, and Supabase all work.
3. In Vercel, import the repo as a new project.
4. Add these environment variables in the Vercel project settings:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
DATABASE_URL=your_postgres_connection_string
```

5. Deploy.

The app will automatically:

- create the `clinic_state` table if it does not exist
- seed the first database record from `data/clinic.json`
- persist new customers, visits, reminders, and reminder updates in Postgres

For a fast prototype launch, no extra migration step is required.
