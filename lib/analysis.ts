import { clamp } from "@/lib/utils";
import type { AiReport, SkinScores } from "@/lib/types";

type AnalysisInput = {
  age: number;
  skinType: string;
  mainConcern: string;
  treatmentHistory: string[];
  clinicTreatmentCatalog: string[];
  photos: Array<{ angle: string; url: string }>;
  notes: string;
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000003;
  }
  return hash;
}

function seededNumber(seed: number, offset: number, min: number, max: number) {
  const value = Math.abs(Math.sin(seed * 0.013 + offset) * 10000);
  const normalized = value - Math.floor(value);
  return Math.round(min + normalized * (max - min));
}

export function generateMockSkinScores(input: AnalysisInput): SkinScores {
  const photoSeed = input.photos.map((item) => item.url).join("|");
  const seed = hashString(
    `${input.age}|${input.skinType}|${input.mainConcern}|${input.notes}|${photoSeed}`
  );

  const concern = input.mainConcern.toLowerCase();
  const treatmentBoost = input.treatmentHistory.join(" ").toLowerCase();

  let acneScore = seededNumber(seed, 1, 15, 70);
  let pigmentationScore = seededNumber(seed, 2, 18, 72);
  let wrinkleScore = seededNumber(seed, 3, 14, 68);
  let poreScore = seededNumber(seed, 4, 20, 75);
  let rednessScore = seededNumber(seed, 5, 12, 70);
  let hydrationScore = seededNumber(seed, 6, 35, 80);
  let firmnessScore = seededNumber(seed, 7, 40, 82);

  if (concern.includes("acne")) {
    acneScore += 18;
    poreScore += 12;
    rednessScore += 10;
    hydrationScore -= 8;
  }
  if (concern.includes("pigment")) {
    pigmentationScore += 20;
  }
  if (concern.includes("wrinkle") || concern.includes("aging") || concern.includes("firm")) {
    wrinkleScore += 16;
    firmnessScore -= 14;
  }
  if (input.skinType === "Dry") {
    hydrationScore -= 10;
  }
  if (input.skinType === "Sensitive") {
    rednessScore += 14;
  }
  if (treatmentBoost.includes("hydrafacial")) {
    hydrationScore += 10;
  }
  if (treatmentBoost.includes("pico")) {
    pigmentationScore -= 10;
  }
  if (treatmentBoost.includes("botox") || treatmentBoost.includes("rf")) {
    wrinkleScore -= 8;
    firmnessScore += 6;
  }

  acneScore = clamp(acneScore, 0, 100);
  pigmentationScore = clamp(pigmentationScore, 0, 100);
  wrinkleScore = clamp(wrinkleScore, 0, 100);
  poreScore = clamp(poreScore, 0, 100);
  rednessScore = clamp(rednessScore, 0, 100);
  hydrationScore = clamp(hydrationScore, 0, 100);
  firmnessScore = clamp(firmnessScore, 0, 100);

  const skinAgeEstimate = clamp(
    Math.round(input.age + (wrinkleScore - firmnessScore) / 7 + (pigmentationScore - hydrationScore) / 12),
    Math.max(input.age - 3, 16),
    input.age + 12
  );

  const overallScore = clamp(
    Math.round(
      100 -
        (acneScore * 0.18 +
          pigmentationScore * 0.16 +
          wrinkleScore * 0.18 +
          poreScore * 0.12 +
          rednessScore * 0.12) +
        hydrationScore * 0.12 +
        firmnessScore * 0.12
    ),
    0,
    100
  );

  return {
    acneScore,
    pigmentationScore,
    wrinkleScore,
    poreScore,
    rednessScore,
    hydrationScore,
    firmnessScore,
    skinAgeEstimate,
    overallScore
  };
}

export function ruleBasedTreatments(scores: SkinScores) {
  const recommendations: string[] = [];

  if (scores.acneScore >= 60) {
    recommendations.push("Acne treatment", "LED calming therapy");
  }
  if (scores.pigmentationScore >= 60) {
    recommendations.push("Brightening maintenance facial", "Pico laser");
  }
  if (scores.wrinkleScore >= 60) {
    recommendations.push("Botox", "RF tightening treatment");
  }
  if (scores.poreScore >= 60) {
    recommendations.push("Microneedling");
  }
  if (scores.rednessScore >= 60) {
    recommendations.push("Barrier repair facial");
  }
  if (scores.hydrationScore <= 45) {
    recommendations.push("Hydrafacial", "Hydration booster");
  }

  return Array.from(new Set(recommendations)).slice(0, 5);
}

export function mockAiOutput(input: {
  customerName: string;
  age: number;
  skinType: string;
  mainConcern: string;
  scores: SkinScores;
  changeSummary: string;
  treatmentHistory: string[];
  clinicTreatmentCatalog: string[];
}): AiReport {
  const topConcerns = [
    input.scores.acneScore > 55 ? "Acne" : null,
    input.scores.pigmentationScore > 55 ? "Pigmentation" : null,
    input.scores.wrinkleScore > 55 ? "Wrinkles" : null,
    input.scores.rednessScore > 55 ? "Redness" : null,
    input.scores.hydrationScore < 45 ? "Hydration" : null,
    input.mainConcern
  ].filter(Boolean) as string[];
  const recommendedTreatments = ruleBasedTreatments(input.scores);
  const products = [
    input.scores.acneScore > 55 ? "Clarifying cleanser" : "Gentle cream cleanser",
    input.scores.pigmentationScore > 55 ? "Vitamin C serum" : "Hydrating essence",
    input.scores.hydrationScore < 45 ? "Ceramide moisturizer" : "Barrier support moisturizer",
    "Daily SPF 50"
  ];

  return {
    consultation_summary: `AI-assisted analysis, not a medical diagnosis. For clinician review. ${input.customerName}'s current profile suggests ${topConcerns
      .slice(0, 3)
      .join(", ").toLowerCase()} as the main areas to address. Overall score is ${input.scores.overallScore}/100 with skin age estimate ${input.scores.skinAgeEstimate}.`,
    customer_summary: `AI-assisted analysis, not a medical diagnosis. For clinician review. Your scan suggests that ${topConcerns
      .slice(0, 2)
      .join(" and ")
      .toLowerCase()} are the clearest areas to focus on right now. ${input.changeSummary}`,
    top_concerns: Array.from(new Set(topConcerns)).slice(0, 4),
    recommended_treatments: recommendedTreatments,
    recommended_products: products,
    follow_up_recommendation: `Based on the current treatment plan and concern profile, arrange follow-up to review ${topConcerns[0]?.toLowerCase() ?? "progress"} and homecare adherence.`,
    staff_notes: `Review skin scores, confirm tolerance of prior treatments (${input.treatmentHistory.join(", ") || "no previous treatments"}), and align today's plan with the clinic catalog.`,
    reminder_message: `AI-assisted analysis, not a medical diagnosis. For clinician review. This is a good time to contact ${input.customerName} regarding follow-up planning after the recent treatment course.`
  };
}
