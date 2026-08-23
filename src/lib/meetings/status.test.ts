import { describe, it, expect } from "vitest";
import { computeDisplayStatus } from "./status";

const HOUR = 60 * 60 * 1000;

describe("computeDisplayStatus", () => {
  it("returns cancelled regardless of timing when status is cancelled", () => {
    const now = new Date();
    const status = computeDisplayStatus({
      status: "cancelled",
      start_time: new Date(now.getTime() + HOUR).toISOString(),
      end_time: new Date(now.getTime() + 2 * HOUR).toISOString(),
    });
    expect(status).toBe("cancelled");
  });

  it("returns completed for a meeting that already ended", () => {
    const now = new Date();
    const status = computeDisplayStatus({
      status: "scheduled",
      start_time: new Date(now.getTime() - 2 * HOUR).toISOString(),
      end_time: new Date(now.getTime() - HOUR).toISOString(),
    });
    expect(status).toBe("completed");
  });

  it("returns in_progress while between start and end", () => {
    const now = new Date();
    const status = computeDisplayStatus({
      status: "scheduled",
      start_time: new Date(now.getTime() - HOUR / 2).toISOString(),
      end_time: new Date(now.getTime() + HOUR / 2).toISOString(),
    });
    expect(status).toBe("in_progress");
  });

  it("returns starting_soon within 15 minutes of start", () => {
    const now = new Date();
    const status = computeDisplayStatus({
      status: "scheduled",
      start_time: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + HOUR).toISOString(),
    });
    expect(status).toBe("starting_soon");
  });

  it("returns upcoming for a meeting further in the future", () => {
    const now = new Date();
    const status = computeDisplayStatus({
      status: "scheduled",
      start_time: new Date(now.getTime() + 2 * HOUR).toISOString(),
      end_time: new Date(now.getTime() + 3 * HOUR).toISOString(),
    });
    expect(status).toBe("upcoming");
  });
});
