import { describe, it, expect } from "vitest";
import { zonedWallTimeToUtcIso, formatInTimezone } from "./timezone";

describe("zonedWallTimeToUtcIso", () => {
  it("converts IST (UTC+5:30, no DST) correctly", () => {
    // 10:00 AM in Kolkata is 04:30 UTC.
    const iso = zonedWallTimeToUtcIso("2026-09-01", "10:00", "Asia/Kolkata");
    expect(iso).toBe("2026-09-01T04:30:00.000Z");
  });

  it("converts UTC correctly", () => {
    const iso = zonedWallTimeToUtcIso("2026-09-01", "12:00", "UTC");
    expect(iso).toBe("2026-09-01T12:00:00.000Z");
  });

  it("is DST-aware for US Eastern time (summer, UTC-4)", () => {
    const iso = zonedWallTimeToUtcIso("2026-07-01", "09:00", "America/New_York");
    expect(iso).toBe("2026-07-01T13:00:00.000Z");
  });

  it("is DST-aware for US Eastern time (winter, UTC-5)", () => {
    const iso = zonedWallTimeToUtcIso("2026-01-15", "09:00", "America/New_York");
    expect(iso).toBe("2026-01-15T14:00:00.000Z");
  });

  it("round-trips through formatInTimezone", () => {
    const iso = zonedWallTimeToUtcIso("2026-09-01", "15:00", "Asia/Kolkata");
    const formatted = formatInTimezone(iso, "Asia/Kolkata");
    expect(formatted).toContain("3:00");
  });
});
