// Placeholder types matching schema.sql.
// Once your Supabase project is live, replace this file by running:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts

export type UserRole = "admin" | "client";
export type ProjectStatus = "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "delayed" | "cancelled";
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  company_name: string | null;
  owner_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress_percent: number;
  start_date: string | null;
  estimated_completion: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  client_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  gst: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project>;
        Update: Partial<Project>;
        Relationships: [];
      };
      invoices: {
        Row: Invoice;
        Insert: Partial<Invoice>;
        Update: Partial<Invoice>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
