import { mockAiOutput } from "@/lib/analysis";
import type { AiReport, SkinScores } from "@/lib/types";

type GenerateInsightsInput = {
  customerName: string;
  age: number;
  skinType: string;
  mainConcern: string;
  treatmentHistory: string[];
  clinicTreatmentCatalog: string[];
  scores: SkinScores;
  changeSummary: string;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const responseSchema = {
  name: "clinic_ai_report",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      consultation_summary: { type: "string" },
      customer_summary: { type: "string" },
      top_concerns: {
        type: "array",
        items: { type: "string" }
      },
      recommended_treatments: {
        type: "array",
        items: { type: "string" }
      },
      recommended_products: {
        type: "array",
        items: { type: "string" }
      },
      follow_up_recommendation: { type: "string" },
      staff_notes: { type: "string" },
      reminder_message: { type: "string" }
    },
    required: [
      "consultation_summary",
      "customer_summary",
      "top_concerns",
      "recommended_treatments",
      "recommended_products",
      "follow_up_recommendation",
      "staff_notes",
      "reminder_message"
    ]
  },
  strict: true
} as const;

export async function generateOpenAIInsights(
  input: GenerateInsightsInput
): Promise<{ data: AiReport; source: "openai" | "mock" }> {
  if (!process.env.OPENAI_API_KEY) {
    return { data: mockAiOutput(input), source: "mock" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are helping a beauty clinic prototype. This is not a medical device. Every user-facing text must include this disclaimer exactly once: AI-assisted analysis, not a medical diagnosis. For clinician review."
          },
          {
            role: "user",
            content: [
              "Return strict JSON only.",
              "Use the provided skin scores, change over time, age, skin type, concerns, treatment history, and clinic catalog to draft:",
              "- consultation summary",
              "- customer-friendly summary",
              "- top concerns",
              "- recommended treatments",
              "- recommended skincare products",
              "- follow-up recommendation",
              "- staff notes",
              "- reminder message",
              "Input:",
              JSON.stringify(input, null, 2)
            ].join("\n")
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: responseSchema
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenAIChatResponse;
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenAI returned no content");
    }

    const parsed = JSON.parse(text) as AiReport;
    return { data: parsed, source: "openai" };
  } catch {
    return { data: mockAiOutput(input), source: "mock" };
  }
}
