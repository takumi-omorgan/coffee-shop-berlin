import { describe, expect, it } from "vitest";
import { formatHours, isOpenAt, sundayOpen } from "../../src/lib/hours";
import type { WeekHours } from "../../src/lib/types";

const ALL_DAY: WeekHours = {
  mon: [{ open: "08:00", close: "18:00" }],
  tue: [{ open: "08:00", close: "18:00" }],
  wed: [{ open: "08:00", close: "18:00" }],
  thu: [{ open: "08:00", close: "18:00" }],
  fri: [{ open: "08:00", close: "18:00" }],
  sat: [{ open: "08:00", close: "18:00" }],
  sun: [{ open: "08:00", close: "18:00" }],
};

describe("isOpenAt — DST boundary", () => {
  it("same UTC wall-time is closed in winter (07:30 Berlin) but open in summer (08:30 Berlin)", () => {
    const winter = new Date(Date.UTC(2024, 0, 15, 6, 30));
    const summer = new Date(Date.UTC(2024, 6, 15, 6, 30));
    expect(isOpenAt(ALL_DAY, winter)).toBe(false);
    expect(isOpenAt(ALL_DAY, summer)).toBe(true);
  });
});

describe("isOpenAt — overnight window", () => {
  const shop: WeekHours = { fri: [{ open: "18:00", close: "02:00" }] };

  it("is open at 01:00 Berlin Saturday (tail of Friday's overnight window)", () => {
    const sat0100 = new Date(Date.UTC(2024, 6, 12, 23, 0));
    expect(isOpenAt(shop, sat0100)).toBe(true);
  });

  it("is closed at 03:00 Berlin Saturday (after the overnight close)", () => {
    const sat0300 = new Date(Date.UTC(2024, 6, 13, 1, 0));
    expect(isOpenAt(shop, sat0300)).toBe(false);
  });
});

describe("isOpenAt — null hours", () => {
  it("returns false for null hours at any instant", () => {
    expect(isOpenAt(null, new Date(Date.UTC(2024, 6, 15, 12, 0)))).toBe(false);
  });
});

describe("sundayOpen", () => {
  it("is true when sun has at least one window", () => {
    expect(sundayOpen({ sun: [{ open: "10:00", close: "16:00" }] })).toBe(true);
  });

  it("is false when hours is null", () => {
    expect(sundayOpen(null)).toBe(false);
  });

  it("is false when there is no sun key", () => {
    expect(sundayOpen({ mon: [{ open: "08:00", close: "18:00" }] })).toBe(false);
  });

  it("is false when sun is an empty array", () => {
    expect(sundayOpen({ sun: [] })).toBe(false);
  });
});

describe("formatHours", () => {
  it("returns 7 entries in fixed mon..sun order with normal days formatted using an en dash", () => {
    const hours: WeekHours = { mon: [{ open: "08:00", close: "18:00" }] };
    const result = formatHours(hours);
    expect(result).toHaveLength(7);
    expect(result.map((r) => r.day)).toEqual([
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
      "sat",
      "sun",
    ]);
    expect(result[0].label).toBe("08:00\u201318:00");
    expect(result[1].label).toBe("Closed");
  });

  it("joins multiple windows with ', '", () => {
    const hours: WeekHours = {
      mon: [
        { open: "08:00", close: "12:00" },
        { open: "14:00", close: "18:00" },
      ],
    };
    expect(formatHours(hours)[0].label).toBe("08:00\u201312:00, 14:00\u201318:00");
  });

  it("labels every day Closed for null hours", () => {
    const result = formatHours(null);
    expect(result).toHaveLength(7);
    for (const r of result) expect(r.label).toBe("Closed");
  });
});
