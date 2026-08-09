// Shared type contracts for the Billing page. No data lives here —
// these describe the shape each component expects once wired to a
// real billing API / Supabase table.

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export type Invoice = {
  id: string;
  invoiceNumber?: string;
  project: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
};

export type CurrentInvoice = Invoice & { invoiceNumber: string };

export type BillingKpis = {
  totalContractValue: number;
  totalContractTrend?: string;
  amountPaid: number;
  amountPaidPercent: number;
  outstandingBalance: number;
  outstandingInvoiceCount: number;
  nextInvoiceAmount: number;
  nextInvoiceDueDate: string;
};

export type PaymentProgress = {
  paidAmount: number;
  totalAmount: number;
  percent: number;
};

export type PaymentMethodType = "visa" | "mastercard" | "upi" | "bank";

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  meta?: string;
  isDefault: boolean;
};

export type TimelineEventStatus = "completed" | "pending";

export type TimelineEvent = {
  id: string;
  label: string;
  date: string;
  time: string;
  status: TimelineEventStatus;
};

export type BillingAddress = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
};

export type BillingSummary = {
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  grandTotal: number;
};

export type DownloadFileType = "invoice" | "receipt" | "tax" | "contract";

export type DownloadFile = {
  id: string;
  name: string;
  type: DownloadFileType;
  date: string;
  size: string;
};

export type UpcomingPaymentStatus = "upcoming" | "due_soon" | "overdue";

export type UpcomingPayment = {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  status: UpcomingPaymentStatus;
};
