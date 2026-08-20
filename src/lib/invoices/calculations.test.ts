import { describe, it, expect } from "vitest";
import { calculateLineItem, calculateInvoiceTotals } from "./calculations";

describe("calculateLineItem", () => {
  it("computes a plain line with no discount", () => {
    const result = calculateLineItem({ quantity: 2, unitPrice: 1500, discountPercent: 0 });
    expect(result.taxableAmount).toBe(3000);
    expect(result.lineTotal).toBe(3000);
  });

  it("applies a percentage discount", () => {
    const result = calculateLineItem({ quantity: 1, unitPrice: 1000, discountPercent: 10 });
    expect(result.taxableAmount).toBe(900);
  });

  it("handles zero quantity as zero amount", () => {
    const result = calculateLineItem({ quantity: 0, unitPrice: 5000, discountPercent: 0 });
    expect(result.taxableAmount).toBe(0);
  });

  it("clamps negative quantity and price to zero instead of going negative", () => {
    const result = calculateLineItem({ quantity: -5, unitPrice: -100, discountPercent: 0 });
    expect(result.taxableAmount).toBe(0);
  });

  it("handles decimal quantities and prices without float drift", () => {
    // 3 units at 33.33 each = 99.99, a classic float-drift trap.
    const result = calculateLineItem({ quantity: 3, unitPrice: 33.33, discountPercent: 0 });
    expect(result.taxableAmount).toBe(99.99);
  });

  it("clamps discount above 100% to fully discounted", () => {
    const result = calculateLineItem({ quantity: 1, unitPrice: 1000, discountPercent: 150 });
    expect(result.taxableAmount).toBe(0);
  });
});

describe("calculateInvoiceTotals", () => {
  it("returns all zeros for an empty invoice", () => {
    const totals = calculateInvoiceTotals([], 18, "cgst_sgst");
    expect(totals).toEqual({
      subtotal: 0,
      discountTotal: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
      grandTotal: 0,
    });
  });

  it("splits GST evenly into CGST + SGST for intra-state at 18%", () => {
    // Subtotal 50,000 -> 9% CGST + 9% SGST = 4,500 each -> total 59,000
    const totals = calculateInvoiceTotals(
      [{ quantity: 1, unitPrice: 50000, discountPercent: 0 }],
      18,
      "cgst_sgst"
    );
    expect(totals.subtotal).toBe(50000);
    expect(totals.cgstAmount).toBe(4500);
    expect(totals.sgstAmount).toBe(4500);
    expect(totals.igstAmount).toBe(0);
    expect(totals.totalTax).toBe(9000);
    expect(totals.grandTotal).toBe(59000);
  });

  it("applies the full rate as IGST for inter-state", () => {
    const totals = calculateInvoiceTotals(
      [{ quantity: 1, unitPrice: 50000, discountPercent: 0 }],
      18,
      "igst"
    );
    expect(totals.igstAmount).toBe(9000);
    expect(totals.cgstAmount).toBe(0);
    expect(totals.sgstAmount).toBe(0);
    expect(totals.grandTotal).toBe(59000);
  });

  it("charges no tax at all for gstType 'none'", () => {
    const totals = calculateInvoiceTotals(
      [{ quantity: 1, unitPrice: 50000, discountPercent: 0 }],
      18,
      "none"
    );
    expect(totals.totalTax).toBe(0);
    expect(totals.grandTotal).toBe(50000);
  });

  it("charges no tax at 0% GST even with cgst_sgst selected", () => {
    const totals = calculateInvoiceTotals(
      [{ quantity: 1, unitPrice: 50000, discountPercent: 0 }],
      0,
      "cgst_sgst"
    );
    expect(totals.totalTax).toBe(0);
    expect(totals.grandTotal).toBe(50000);
  });

  it("sums multiple line items with mixed discounts before taxing", () => {
    const totals = calculateInvoiceTotals(
      [
        { quantity: 2, unitPrice: 10000, discountPercent: 0 }, // 20,000
        { quantity: 1, unitPrice: 5000, discountPercent: 20 }, // 4,000
        { quantity: 3, unitPrice: 999, discountPercent: 0 }, // 2,997
      ],
      18,
      "cgst_sgst"
    );
    expect(totals.subtotal).toBe(20000 + 5000 + 2997);
    expect(totals.discountTotal).toBe(1000);
    expect(totals.taxableAmount).toBe(20000 + 4000 + 2997);
    expect(totals.grandTotal).toBe(totals.taxableAmount + totals.totalTax);
  });

  it("handles an all-zero-quantity invoice without dividing by zero or going negative", () => {
    const totals = calculateInvoiceTotals(
      [
        { quantity: 0, unitPrice: 100, discountPercent: 0 },
        { quantity: 0, unitPrice: 200, discountPercent: 50 },
      ],
      18,
      "cgst_sgst"
    );
    expect(totals.grandTotal).toBe(0);
  });

  it("never lets discount push the taxable amount negative", () => {
    const totals = calculateInvoiceTotals(
      [{ quantity: 1, unitPrice: 1000, discountPercent: 100 }],
      18,
      "cgst_sgst"
    );
    expect(totals.taxableAmount).toBe(0);
    expect(totals.grandTotal).toBe(0);
  });
});
