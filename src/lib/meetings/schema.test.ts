import { describe, it, expect } from "vitest";
import { meetingInputSchema } from "./schema";

const validBase = {
  title: "Kickoff call",
  description: "",
  location: "",
  provider: "google_meet" as const,
  startTime: "2026-09-01T10:00:00+05:30",
  endTime: "2026-09-01T10:30:00+05:30",
  timezone: "Asia/Kolkata",
  attendees: [{ name: "Jane", email: "jane@example.com" }],
  idempotencyKey: "5b1e9f2a-6e5a-4e2a-9a7d-9d2a6e5a4e2a",
};

describe("meetingInputSchema", () => {
  it("accepts a valid meeting", () => {
    const result = meetingInputSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = meetingInputSchema.safeParse({ ...validBase, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects end time before start time", () => {
    const result = meetingInputSchema.safeParse({ ...validBase, endTime: "2026-09-01T09:00:00+05:30" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("endTime");
    }
  });

  it("rejects an invalid attendee email", () => {
    const result = meetingInputSchema.safeParse({ ...validBase, attendees: [{ name: "Jane", email: "not-an-email" }] });
    expect(result.success).toBe(false);
  });

  it("rejects a datetime without an explicit offset", () => {
    const result = meetingInputSchema.safeParse({ ...validBase, startTime: "2026-09-01T10:00:00" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown provider", () => {
    const result = meetingInputSchema.safeParse({ ...validBase, provider: "webex" });
    expect(result.success).toBe(false);
  });

  it("requires a valid idempotency key", () => {
    const result = meetingInputSchema.safeParse({ ...validBase, idempotencyKey: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("caps attendees at 50", () => {
    const attendees = Array.from({ length: 51 }, (_, i) => ({ name: `A${i}`, email: `a${i}@example.com` }));
    const result = meetingInputSchema.safeParse({ ...validBase, attendees });
    expect(result.success).toBe(false);
  });
});
