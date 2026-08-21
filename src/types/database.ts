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
export type GstType = "none" | "cgst_sgst" | "igst";
export type PaymentMethod = "bank_transfer" | "card" | "upi" | "cash" | "other";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type ApprovalStatus = "pending" | "approved" | "changes_requested";
export type DocumentFolder = "contracts" | "invoices" | "design_files" | "requirements" | "reports" | "others";
export type BusinessType = "individual" | "startup" | "sme" | "enterprise" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

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
  business_type: BusinessType | null;
  avatar_url: string | null;
  preferred_communication: string | null;
  notes: string | null;
  preferences: Record<string, unknown>;
  assigned_admin_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicket = {
  id: string;
  client_id: string;
  project_id: string | null;
  subject: string;
  description: string | null;
  status: TicketStatus;
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
  currency: string;
  notes: string | null;
  terms: string | null;
  gst_percent: number;
  gst_type: GstType;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceLineItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  taxable_amount: number;
  line_total: number;
  order_index: number;
  created_at: string;
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

export type ProjectApproval = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: ApprovalStatus;
  note: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

export type Document = {
  id: string;
  project_id: string | null;
  uploaded_by: string;
  folder: DocumentFolder;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  project_id: string | null;
  sender_id: string;
  recipient_id: string | null;
  body: string;
  attachment_path: string | null;
  is_read: boolean;
  created_at: string;
};

export type NotificationType =
  | "project_updated"
  | "invoice_generated"
  | "task_completed"
  | "meeting_scheduled"
  | "new_message"
  | "payment_received";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  client_id: string;
  assigned_admin_id: string;
  created_at: string;
  updated_at: string;
};

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  project_id: string | null;
  client_id: string | null;
  title: string;
  scheduled_at: string;
  duration_minutes: number | null;
  meeting_link: string | null;
  notes: string | null;
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
      invoice_line_items: {
        Row: InvoiceLineItem;
        Insert: Partial<InvoiceLineItem>;
        Update: Partial<InvoiceLineItem>;
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
      project_approvals: {
        Row: ProjectApproval;
        Insert: Partial<ProjectApproval>;
        Update: Partial<ProjectApproval>;
        Relationships: [];
      };
      documents: {
        Row: Document;
        Insert: Partial<Document>;
        Update: Partial<Document>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: Partial<Message>;
        Update: Partial<Message>;
        Relationships: [];
      };
      meetings: {
        Row: Meeting;
        Insert: Partial<Meeting>;
        Update: Partial<Meeting>;
        Relationships: [];
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: Partial<SupportTicket>;
        Update: Partial<SupportTicket>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
        Relationships: [];
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation>;
        Update: Partial<Conversation>;
        Relationships: [];
      };
      direct_messages: {
        Row: DirectMessage;
        Insert: Partial<DirectMessage>;
        Update: Partial<DirectMessage>;
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
