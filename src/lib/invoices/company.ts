/**
 * Issuer details printed on every invoice PDF. Blyu is a single-tenant
 * agency (one company issuing invoices to many clients), so this is a
 * static config object rather than a database table. Override any field
 * via env vars before generating real invoices — the fallback strings are
 * placeholders, not real business details.
 */
export const COMPANY_INFO = {
  name: process.env.INVOICE_COMPANY_NAME || "Blyu",
  legalName: process.env.INVOICE_COMPANY_LEGAL_NAME || "Blyu",
  address: process.env.INVOICE_COMPANY_ADDRESS || "Update INVOICE_COMPANY_ADDRESS in your environment",
  gstNumber: process.env.INVOICE_COMPANY_GSTIN || "",
  email: process.env.INVOICE_COMPANY_EMAIL || "billing@blyu.app",
  phone: process.env.INVOICE_COMPANY_PHONE || "",
  website: process.env.INVOICE_COMPANY_WEBSITE || "",
  bankName: process.env.INVOICE_BANK_NAME || "",
  bankAccountName: process.env.INVOICE_BANK_ACCOUNT_NAME || "",
  bankAccountNumber: process.env.INVOICE_BANK_ACCOUNT_NUMBER || "",
  bankIfsc: process.env.INVOICE_BANK_IFSC || "",
};
