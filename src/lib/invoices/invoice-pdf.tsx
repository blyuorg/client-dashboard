import * as React from "react";
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatMoney as formatMoneyBase } from "@/lib/invoices/calculations";
import { COMPANY_INFO } from "@/lib/invoices/company";
import type { GstType, InvoiceStatus } from "@/types/database";

/**
 * The base-14 Helvetica font (react-pdf's default, no embedding required)
 * has no glyph for ₹, so `formatMoney`'s Intl output renders as a broken
 * character in the PDF. Swap it for a plain "INR" prefix here only — the
 * on-screen UI keeps the real symbol via the shared formatter.
 */
function formatMoney(amount: number, currency = "INR"): string {
  const formatted = formatMoneyBase(amount, currency).replace(/^[^\d-]+/, "").trim();
  return `${currency} ${formatted}`;
}

/**
 * Next's app-router build substitutes its own vendored (canary) React for
 * every `import ... from "react"` it compiles, including this file — but
 * @react-pdf/renderer's bundled reconciler resolves the project's real
 * installed React (18.x) directly from node_modules, bypassing that
 * substitution. The two React copies tag elements differently ($$typeof:
 * "react.transitional.element" vs "react.element"), so elements built with
 * the substituted React are invalid input to the reconciler and it throws
 * React error #31 on every render.
 *
 * `turbopackIgnore`/`webpackIgnore` make this one `require("react")` skip
 * both bundlers' static resolution, so it genuinely resolves at runtime via
 * Node — landing on the same real React 18 copy the reconciler uses. `h`
 * (its `createElement`) is then used instead of JSX so no element in this
 * file is ever created via the substituted React.
 */
const RealReact: typeof React = require(/* turbopackIgnore: true */ /* webpackIgnore: true */ "react");
const h = RealReact.createElement;

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  muted: { color: "#6b7280" },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", textAlign: "right", marginBottom: 4 },
  badge: {
    alignSelf: "flex-end",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginTop: 4,
  },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  sectionBlock: { width: "48%" },
  sectionLabel: { fontSize: 9, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  bold: { fontFamily: "Helvetica-Bold" },
  metaGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  metaItem: { width: "24%" },
  table: { marginBottom: 16 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 6, paddingHorizontal: 6 },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  colDesc: { width: "40%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "16%", textAlign: "right" },
  colDiscount: { width: "12%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  th: { fontFamily: "Helvetica-Bold", fontSize: 9, textTransform: "uppercase", color: "#4b5563" },
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 20 },
  totalsBox: { width: "45%" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  grandTotalText: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  notesBlock: { marginBottom: 12 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

const STATUS_COLORS: Record<InvoiceStatus, { bg: string; color: string }> = {
  draft: { bg: "#f3f4f6", color: "#4b5563" },
  pending: { bg: "#fef3c7", color: "#92400e" },
  paid: { bg: "#d1fae5", color: "#065f46" },
  overdue: { bg: "#fee2e2", color: "#991b1b" },
  cancelled: { bg: "#f3f4f6", color: "#6b7280" },
};

function gstLabel(type: GstType): string {
  if (type === "igst") return "IGST";
  if (type === "cgst_sgst") return "CGST + SGST";
  return "No GST";
}

export type InvoicePdfLineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  taxable_amount: number;
};

export type InvoicePdfData = {
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  currency: string;
  notes: string | null;
  terms: string | null;
  gst_percent: number;
  gst_type: GstType;
  subtotal: number;
  discount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total: number;
  projectTitle: string;
  client: {
    name: string;
    companyName: string | null;
    email: string;
    address: string | null;
    gstNumber: string | null;
  };
  lineItems: InvoicePdfLineItem[];
};

function formatDatePdf(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
  const statusColors = STATUS_COLORS[invoice.status];
  const taxableAmount = invoice.subtotal - invoice.discount;

  return h(
    Document,
    { title: `Invoice ${invoice.invoice_number}` },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(
        View,
        { style: styles.headerRow },
        h(
          View,
          null,
          h(Text, { style: styles.companyName }, COMPANY_INFO.name),
          h(Text, { style: styles.muted }, COMPANY_INFO.address),
          !!COMPANY_INFO.gstNumber && h(Text, { style: styles.muted }, `GSTIN: ${COMPANY_INFO.gstNumber}`),
          !!COMPANY_INFO.email && h(Text, { style: styles.muted }, COMPANY_INFO.email)
        ),
        h(
          View,
          null,
          h(Text, { style: styles.invoiceTitle }, "INVOICE"),
          h(Text, { style: { textAlign: "right" } }, invoice.invoice_number),
          h(
            Text,
            { style: [styles.badge, { backgroundColor: statusColors.bg, color: statusColors.color }] },
            invoice.status
          )
        )
      ),

      h(
        View,
        { style: styles.sectionRow },
        h(
          View,
          { style: styles.sectionBlock },
          h(Text, { style: styles.sectionLabel }, "Billed to"),
          h(Text, { style: styles.bold }, invoice.client.companyName || invoice.client.name),
          !!invoice.client.companyName && h(Text, null, invoice.client.name),
          h(Text, { style: styles.muted }, invoice.client.email),
          !!invoice.client.address && h(Text, { style: styles.muted }, invoice.client.address),
          !!invoice.client.gstNumber && h(Text, { style: styles.muted }, `GSTIN: ${invoice.client.gstNumber}`)
        ),
        h(
          View,
          { style: [styles.sectionBlock, { alignItems: "flex-end" }] },
          h(Text, { style: styles.sectionLabel }, "Project"),
          h(Text, { style: styles.bold }, invoice.projectTitle)
        )
      ),

      h(
        View,
        { style: styles.metaGrid },
        h(
          View,
          { style: styles.metaItem },
          h(Text, { style: styles.sectionLabel }, "Invoice date"),
          h(Text, null, formatDatePdf(invoice.invoice_date))
        ),
        h(
          View,
          { style: styles.metaItem },
          h(Text, { style: styles.sectionLabel }, "Due date"),
          h(Text, null, formatDatePdf(invoice.due_date))
        ),
        h(
          View,
          { style: styles.metaItem },
          h(Text, { style: styles.sectionLabel }, "GST treatment"),
          h(Text, null, gstLabel(invoice.gst_type))
        ),
        h(
          View,
          { style: styles.metaItem },
          h(Text, { style: styles.sectionLabel }, "Currency"),
          h(Text, null, invoice.currency)
        )
      ),

      h(
        View,
        { style: styles.table },
        h(
          View,
          { style: styles.tableHeaderRow },
          h(Text, { style: [styles.colDesc, styles.th] }, "Description"),
          h(Text, { style: [styles.colQty, styles.th] }, "Qty"),
          h(Text, { style: [styles.colPrice, styles.th] }, "Rate"),
          h(Text, { style: [styles.colDiscount, styles.th] }, "Disc."),
          h(Text, { style: [styles.colAmount, styles.th] }, "Amount")
        ),
        ...invoice.lineItems.map((item, index) =>
          h(
            View,
            { style: styles.tableRow, key: index },
            h(Text, { style: styles.colDesc }, item.description),
            h(Text, { style: styles.colQty }, item.quantity),
            h(Text, { style: styles.colPrice }, formatMoney(item.unit_price, invoice.currency)),
            h(Text, { style: styles.colDiscount }, item.discount_percent > 0 ? `${item.discount_percent}%` : "—"),
            h(Text, { style: styles.colAmount }, formatMoney(item.taxable_amount, invoice.currency))
          )
        )
      ),

      h(
        View,
        { style: styles.totalsWrap },
        h(
          View,
          { style: styles.totalsBox },
          h(
            View,
            { style: styles.totalsRow },
            h(Text, null, "Subtotal"),
            h(Text, null, formatMoney(invoice.subtotal, invoice.currency))
          ),
          invoice.discount > 0 &&
            h(
              View,
              { style: styles.totalsRow },
              h(Text, null, "Discount"),
              h(Text, null, `-${formatMoney(invoice.discount, invoice.currency)}`)
            ),
          h(
            View,
            { style: styles.totalsRow },
            h(Text, null, "Taxable amount"),
            h(Text, null, formatMoney(taxableAmount, invoice.currency))
          ),
          invoice.gst_type === "cgst_sgst" &&
            h(
              View,
              null,
              h(
                View,
                { style: styles.totalsRow },
                h(Text, null, `CGST ${(invoice.gst_percent / 2).toFixed(2)}%`),
                h(Text, null, formatMoney(invoice.cgst_amount, invoice.currency))
              ),
              h(
                View,
                { style: styles.totalsRow },
                h(Text, null, `SGST ${(invoice.gst_percent / 2).toFixed(2)}%`),
                h(Text, null, formatMoney(invoice.sgst_amount, invoice.currency))
              )
            ),
          invoice.gst_type === "igst" &&
            h(
              View,
              { style: styles.totalsRow },
              h(Text, null, `IGST ${invoice.gst_percent.toFixed(2)}%`),
              h(Text, null, formatMoney(invoice.igst_amount, invoice.currency))
            ),
          h(
            View,
            { style: styles.grandTotalRow },
            h(Text, { style: styles.grandTotalText }, "Grand Total"),
            h(Text, { style: styles.grandTotalText }, formatMoney(invoice.total, invoice.currency))
          )
        )
      ),

      !!(COMPANY_INFO.bankAccountNumber || COMPANY_INFO.bankName) &&
        h(
          View,
          { style: styles.notesBlock },
          h(Text, { style: styles.sectionLabel }, "Payment information"),
          !!COMPANY_INFO.bankName && h(Text, null, `Bank: ${COMPANY_INFO.bankName}`),
          !!COMPANY_INFO.bankAccountName && h(Text, null, `Account name: ${COMPANY_INFO.bankAccountName}`),
          !!COMPANY_INFO.bankAccountNumber && h(Text, null, `Account number: ${COMPANY_INFO.bankAccountNumber}`),
          !!COMPANY_INFO.bankIfsc && h(Text, null, `IFSC: ${COMPANY_INFO.bankIfsc}`)
        ),

      !!invoice.notes &&
        h(
          View,
          { style: styles.notesBlock },
          h(Text, { style: styles.sectionLabel }, "Notes"),
          h(Text, null, invoice.notes)
        ),

      !!invoice.terms &&
        h(
          View,
          { style: styles.notesBlock },
          h(Text, { style: styles.sectionLabel }, "Terms"),
          h(Text, null, invoice.terms)
        ),

      h(
        Text,
        { style: styles.footer },
        `${COMPANY_INFO.name} · ${COMPANY_INFO.email}${COMPANY_INFO.website ? ` · ${COMPANY_INFO.website}` : ""}`
      )
    )
  );
}

export function renderInvoicePdfBuffer(invoice: InvoicePdfData): Promise<Buffer> {
  // react-pdf's types expect a ReactElement<DocumentProps>, but at runtime
  // it accepts any element whose render tree resolves to a <Document> (the
  // documented pattern of wrapping it in your own component). The cast
  // below reflects that documented, correct usage — not a type error.
  return renderToBuffer(h(InvoicePdfDocument, { invoice }) as unknown as React.ReactElement<React.ComponentProps<typeof Document>>);
}
