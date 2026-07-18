// Placeholder types matching schema.sql.
// Once your Supabase project is live, replace this file by running:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
//
// NOTE: these are declared with `type`, not `interface`. @supabase/supabase-js's
// generic Database constraint resolution (createClient<Database>) does not
// resolve correctly through `interface`-declared Row/Insert/Update shapes on
// current versions — it silently collapses query results to `never`. Keep
// these as `type` aliases (this is also what `supabase gen types` emits).

export type UserRole = "admin" | "client";
export type ProjectStatus = "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "delayed" | "cancelled" | "blocked";
export type MilestoneStatus = "pending" | "in_progress" | "completed";
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "bank_transfer" | "card" | "upi" | "cash" | "other";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type Profile = {
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
};

export type Project = {
  id: string;
  client_id: string;
  title: string;
  category: string | null;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress_percent: number;
  start_date: string | null;
  estimated_completion: string | null;
  actual_completion: string | null;
  deadline: string | null;
  assigned_team: string[] | null;
  deliverables: string | null;
  requirements: string | null;
  project_notes: string | null;
  is_archived: boolean;
  budget: number | null;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  order_index: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  notes: string | null;
  status: TaskStatus;
  priority: ProjectPriority;
  deadline: string | null;
  assigned_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
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
};

export type Payment = {
  id: string;
  invoice_id: string;
  client_id: string;
  transaction_id: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: string | null;
  receipt_storage_path: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  project_id: string | null;
  actor_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
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
      milestones: {
        Row: Milestone;
        Insert: Partial<Milestone>;
        Update: Partial<Milestone>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task>;
        Update: Partial<Task>;
        Relationships: [];
      };
      invoices: {
        Row: Invoice;
        Insert: Partial<Invoice>;
        Update: Partial<Invoice>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Partial<Payment>;
        Update: Partial<Payment>;
        Relationships: [];
      };
      activities: {
        Row: Activity;
        Insert: Partial<Activity>;
        Update: Partial<Activity>;
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
};
