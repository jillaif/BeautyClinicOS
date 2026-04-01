export type SkinType = "Oily" | "Dry" | "Combination" | "Sensitive" | "Normal";

export type ReminderStatus = "upcoming" | "due_soon" | "overdue" | "completed";

export type ReminderType =
  | "client_follow_up"
  | "staff_outreach"
  | "doctor_check_in";

export type PhotoAngle = "front" | "left" | "right";

export type SkinScores = {
  acneScore: number;
  pigmentationScore: number;
  wrinkleScore: number;
  poreScore: number;
  rednessScore: number;
  hydrationScore: number;
  firmnessScore: number;
  skinAgeEstimate: number;
  overallScore: number;
};

export type Customer = {
  id: string;
  name: string;
  age: number;
  gender: string;
  skinType: SkinType;
  mainConcern: string;
  notes: string;
  createdAt: string;
};

export type Photo = {
  id: string;
  visitId: string;
  angle: PhotoAngle;
  url: string;
};

export type Visit = {
  id: string;
  customerId: string;
  visitDate: string;
  treatmentPerformed: string;
  clinicianNotes: string;
  aiReport: AiReport;
  skinScores: SkinScores;
  photos: Photo[];
};

export type Reminder = {
  id: string;
  customerId: string;
  visitId: string;
  treatmentType: string;
  reminderType: ReminderType;
  dueDate: string;
  status: ReminderStatus;
  message: string;
  assignedTo: string;
};

export type ClinicData = {
  customers: Customer[];
  visits: Visit[];
  reminders: Reminder[];
  treatmentCatalog: string[];
};

export type AiReport = {
  consultation_summary: string;
  customer_summary: string;
  top_concerns: string[];
  recommended_treatments: string[];
  recommended_products: string[];
  follow_up_recommendation: string;
  staff_notes: string;
  reminder_message: string;
};

export type CustomerDetail = Customer & {
  visits: Visit[];
  reminders: Reminder[];
  latestVisit?: Visit;
  baselineVisit?: Visit;
  avgImprovement: number;
  progressSummary: string;
};

export type DashboardStats = {
  totalCustomers: number;
  visitsThisMonth: number;
  avgImprovement: number;
  upcomingFollowUps: number;
};
