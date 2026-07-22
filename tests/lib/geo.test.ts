import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assignNeighborhood, pointInPolygon } from "../../src/lib/geo";

const geojson = JSON.parse(
  readFileSync(
    resolve(__dirname, "../fixtures/neighborhoods-mini.geojson"),
    "utf8",
  ),
);

describe("pointInPolygon", () => {
  it("returns true for a point inside the outer ring", () => {
    const square: number[][][] = [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
    ];
    expect(pointInPolygon([5, 5], square)).toBe(true);
  });

  it("returns false for a point outside the polygon", () => {
    const square: number[][][] = [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
    ];
    expect(pointInPolygon([20, 20], square)).toBe(false);
  });

  it("returns false for a point inside a hole", () => {
    const polygonWithHole: number[][][] = [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
      [
        [4, 4],
        [6, 4],
        [6, 6],
        [4, 6],
        [4, 4],
      ],
    ];
    expect(pointInPolygon([5, 5], polygonWithHole)).toBe(false);
    expect(pointInPolygon([2, 2], polygonWithHole)).toBe(true);
  });
});

describe("assignNeighborhood", () => {
  it("returns the slugified feature name for a point in a simple Polygon", () => {
    // Mitte-Test square: lon 13.39-13.41, lat 52.51-52.53
    expect(assignNeighborhood(52.52, 13.4, geojson)).toBe("mitte-test");
  });

  it("returns the slug for a point in the first disjoint square of the MultiPolygon", () => {
    // Split-Test square A: lon 13.44-13.46, lat 52.54-52.56
    expect(assignNeighborhood(52.55, 13.45, geojson)).toBe("split-test");
  });

  it("returns the slug for a point in the second disjoint square of the MultiPolygon", () => {
    // Split-Test square B: lon 13.49-13.51, lat 52.47-52.49
    expect(assignNeighborhood(52.48, 13.5, geojson)).toBe("split-test");
  });

  it("returns null for a point in no feature", () => {
    expect(assignNeighborhood(52.6, 13.3, geojson)).toBeNull();
  });
});
