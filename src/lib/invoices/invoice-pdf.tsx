import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatMoney } from "@/lib/invoices/calculations";
import { COMPANY_INFO } from "@/lib/invoices/company";
import type { GstType, InvoiceStatus } from "@/types/database";

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

  return (
    <Document title={`Invoice ${invoice.invoice_number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.muted}>{COMPANY_INFO.address}</Text>
            {!!COMPANY_INFO.gstNumber && <Text style={styles.muted}>GSTIN: {COMPANY_INFO.gstNumber}</Text>}
            {!!COMPANY_INFO.email && <Text style={styles.muted}>{COMPANY_INFO.email}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={{ textAlign: "right" }}>{invoice.invoice_number}</Text>
            <Text
              style={[styles.badge, { backgroundColor: statusColors.bg, color: statusColors.color }]}
            >
              {invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Billed to</Text>
            <Text style={styles.bold}>{invoice.client.companyName || invoice.client.name}</Text>
            {!!invoice.client.companyName && <Text>{invoice.client.name}</Text>}
            <Text style={styles.muted}>{invoice.client.email}</Text>
            {!!invoice.client.address && <Text style={styles.muted}>{invoice.client.address}</Text>}
            {!!invoice.client.gstNumber && <Text style={styles.muted}>GSTIN: {invoice.client.gstNumber}</Text>}
          </View>
          <View style={[styles.sectionBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.sectionLabel}>Project</Text>
            <Text style={styles.bold}>{invoice.projectTitle}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.sectionLabel}>Invoice date</Text>
            <Text>{formatDatePdf(invoice.invoice_date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.sectionLabel}>Due date</Text>
            <Text>{formatDatePdf(invoice.due_date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.sectionLabel}>GST treatment</Text>
            <Text>{gstLabel(invoice.gst_type)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.sectionLabel}>Currency</Text>
            <Text>{invoice.currency}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.th]}>Description</Text>
            <Text style={[styles.colQty, styles.th]}>Qty</Text>
            <Text style={[styles.colPrice, styles.th]}>Rate</Text>
            <Text style={[styles.colDiscount, styles.th]}>Disc.</Text>
            <Text style={[styles.colAmount, styles.th]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatMoney(item.unit_price, invoice.currency)}</Text>
              <Text style={styles.colDiscount}>{item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}</Text>
              <Text style={styles.colAmount}>{formatMoney(item.taxable_amount, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{formatMoney(invoice.subtotal, invoice.currency)}</Text>
            </View>
            {invoice.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text>Discount</Text>
                <Text>-{formatMoney(invoice.discount, invoice.currency)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text>Taxable amount</Text>
              <Text>{formatMoney(taxableAmount, invoice.currency)}</Text>
            </View>
            {invoice.gst_type === "cgst_sgst" && (
              <>
                <View style={styles.totalsRow}>
                  <Text>CGST {(invoice.gst_percent / 2).toFixed(2)}%</Text>
                  <Text>{formatMoney(invoice.cgst_amount, invoice.currency)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text>SGST {(invoice.gst_percent / 2).toFixed(2)}%</Text>
                  <Text>{formatMoney(invoice.sgst_amount, invoice.currency)}</Text>
                </View>
              </>
            )}
            {invoice.gst_type === "igst" && (
              <View style={styles.totalsRow}>
                <Text>IGST {invoice.gst_percent.toFixed(2)}%</Text>
                <Text>{formatMoney(invoice.igst_amount, invoice.currency)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>Grand Total</Text>
              <Text style={styles.grandTotalText}>{formatMoney(invoice.total, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        {(COMPANY_INFO.bankAccountNumber || COMPANY_INFO.bankName) && (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Payment information</Text>
            {!!COMPANY_INFO.bankName && <Text>Bank: {COMPANY_INFO.bankName}</Text>}
            {!!COMPANY_INFO.bankAccountName && <Text>Account name: {COMPANY_INFO.bankAccountName}</Text>}
            {!!COMPANY_INFO.bankAccountNumber && <Text>Account number: {COMPANY_INFO.bankAccountNumber}</Text>}
            {!!COMPANY_INFO.bankIfsc && <Text>IFSC: {COMPANY_INFO.bankIfsc}</Text>}
          </View>
        )}

        {!!invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {!!invoice.terms && (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Terms</Text>
            <Text>{invoice.terms}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {COMPANY_INFO.name} · {COMPANY_INFO.email}
          {COMPANY_INFO.website ? ` · ${COMPANY_INFO.website}` : ""}
        </Text>
      </Page>
    </Document>
  );
}
