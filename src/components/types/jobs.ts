// src/types/jobs.ts
export type JobStatus = "draft" | "published" | "paused" | "archived";
export type JobType = "full_time" | "part_time" | "freelance" | "internship" | "temporary";
export type JobModality = "onsite" | "remote" | "hybrid";

export interface JobListing {
  id: string;
  title: string;
  slug: string | null;
  company_name: string;
  company_slug: string | null;
  company_type: string | null;

  job_type: JobType;
  modality: JobModality;
  seniority: string | null;
  category: string | null;
  subcategory: string | null;

  municipality: string | null;
  city: string | null;
  region: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;

  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string | null;
  salary_visible: boolean | null;
  schedule: string | null;
  work_days: string | null;
  contract_type: string | null;

  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;

  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  application_link: string | null;
  application_instructions: string | null;

  source_type: string | null;
  source_url: string | null;
  is_featured: boolean | null;
  status: JobStatus;
  published_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
