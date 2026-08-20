import type { GstType } from "@/types/database";

/**
 * All money math happens in integer paise (1 rupee = 100 paise) so that
 * repeated addition/subtraction/percentage math can't drift the way
 * floating-point rupee arithmetic does. Callers pass/receive rupees;
 * only this module touches paise.
 */
function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function toRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/** Percentage of a paise amount, rounded to the nearest paisa (half up). */
function percentOfPaise(paise: number, percent: number): number {
  return Math.round((paise * percent) / 100);
}

export type LineItemInput = {
  quantity: number;
  unitPrice: number;
  discountPercent: number;
};

export type LineItemResult = {
  taxableAmount: number;
  lineTotal: number;
};

/**
 * A single line item's pre-tax amount. `lineTotal` here is the same as
 * `taxableAmount` — GST is applied at the invoice level, not per line —
 * kept as a distinct field because invoice_line_items stores both and a
 * future per-line-item tax rate is a plausible extension.
 */
export function calculateLineItem(input: LineItemInput): LineItemResult {
  const quantity = Math.max(0, input.quantity);
  const unitPrice = Math.max(0, input.unitPrice);
  const discountPercent = Math.min(100, Math.max(0, input.discountPercent));

  const grossPaise = toPaise(quantity * unitPrice);
  const discountPaise = percentOfPaise(grossPaise, discountPercent);
  const netPaise = grossPaise - discountPaise;

  return {
    taxableAmount: toRupees(netPaise),
    lineTotal: toRupees(netPaise),
  };
}

export type InvoiceTotals = {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
};

/**
 * subtotal = sum of gross (pre-discount) line amounts
 * discountTotal = sum of per-line discounts
 * taxableAmount = subtotal - discountTotal
 * GST is computed on taxableAmount: split evenly into CGST+SGST for
 * intra-state, or wholly into IGST for inter-state. gstType "none"
 * produces zero tax (e.g. for non-taxable/export invoices).
 */
export function calculateInvoiceTotals(
  lineItems: LineItemInput[],
  gstPercent: number,
  gstType: GstType
): InvoiceTotals {
  let subtotalPaise = 0;
  let discountPaise = 0;

  for (const item of lineItems) {
    const quantity = Math.max(0, item.quantity);
    const unitPrice = Math.max(0, item.unitPrice);
    const discountPercent = Math.min(100, Math.max(0, item.discountPercent));

    const grossPaise = toPaise(quantity * unitPrice);
    subtotalPaise += grossPaise;
    discountPaise += percentOfPaise(grossPaise, discountPercent);
  }

  const taxablePaise = subtotalPaise - discountPaise;
  const clampedGstPercent = Math.max(0, gstPercent);

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (gstType === "cgst_sgst") {
    const halfPercent = clampedGstPercent / 2;
    cgstPaise = percentOfPaise(taxablePaise, halfPercent);
    sgstPaise = percentOfPaise(taxablePaise, halfPercent);
  } else if (gstType === "igst") {
    igstPaise = percentOfPaise(taxablePaise, clampedGstPercent);
  }

  const totalTaxPaise = cgstPaise + sgstPaise + igstPaise;
  const grandTotalPaise = taxablePaise + totalTaxPaise;

  return {
    subtotal: toRupees(subtotalPaise),
    discountTotal: toRupees(discountPaise),
    taxableAmount: toRupees(taxablePaise),
    cgstAmount: toRupees(cgstPaise),
    sgstAmount: toRupees(sgstPaise),
    igstAmount: toRupees(igstPaise),
    totalTax: toRupees(totalTaxPaise),
    grandTotal: toRupees(grandTotalPaise),
  };
}

export function formatMoney(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
