import { expect, describe, it, test } from "bun:test";
import { Effect, Option } from "effect";
import {
  addHeadings,
  directionForTurn,
  headingChangeAmount,
  headingDecodeSync,
  HeadingSchema,
  headingRangeContains,
  subtractHeadings,
  RandomHeading,
  Heading,
  getCardinalDirection,
} from "./Heading";
import { identity } from "effect/Function";

describe("headingDecodeSync", () => {
  it("should create a valid headingDecodeSync", () => {
    expect(() => headingDecodeSync(350)).not.toThrow();
  });

  it("should throw an error if the value is not a valid headingDecodeSync", () => {
    expect(() => headingDecodeSync(365)).toThrow();
    expect(() => headingDecodeSync(-1)).toThrow();
  });

  it("should throw an error if the value is not an integer", () => {
    expect(() => headingDecodeSync(100.1)).toThrow();
  });
});

describe("addHeading", () => {
  it("should add two headings correctly without wrapping", () => {
    expect(addHeadings(headingDecodeSync(180))(headingDecodeSync(100))).toBe(
      headingDecodeSync(280)
    );
  });

  it("should wrap around correctly when adding two headings", () => {
    expect(addHeadings(headingDecodeSync(300))(headingDecodeSync(90))).toBe(
      headingDecodeSync(30)
    );
  });

  it("should handle 360 correctly", () => {
    expect(addHeadings(headingDecodeSync(360))(headingDecodeSync(360))).toBe(
      headingDecodeSync(360)
    );
  });

  it("should throw an error if any heading is invalid", () => {
    expect(() =>
      addHeadings(headingDecodeSync(361))(headingDecodeSync(90))
    ).toThrow();
    expect(() =>
      addHeadings(headingDecodeSync(90))(headingDecodeSync(-10))
    ).toThrow();
  });
});

describe("subtractHeadings", () => {
  it("should subtract two headings correctly without wrapping", () => {
    expect(
      subtractHeadings(headingDecodeSync(180))(headingDecodeSync(100))
    ).toBe(headingDecodeSync(80));
  });

  it("should wrap around correctly when subtracting two headings", () => {
    expect(
      subtractHeadings(headingDecodeSync(90))(headingDecodeSync(300))
    ).toBe(headingDecodeSync(150));
  });

  it("should handle 360 correctly", () => {
    expect(
      subtractHeadings(headingDecodeSync(360))(headingDecodeSync(90))
    ).toBe(headingDecodeSync(270));
  });

  it("should return 360 for subtracting a heading from itself", () => {
    expect(subtractHeadings(headingDecodeSync(90))(headingDecodeSync(90))).toBe(
      headingDecodeSync(360)
    );
  });

  it("should throw an error if any heading is invalid", () => {
    expect(() =>
      subtractHeadings(headingDecodeSync(361))(headingDecodeSync(90))
    ).toThrow();
    expect(() =>
      subtractHeadings(headingDecodeSync(90))(headingDecodeSync(-10))
    ).toThrow();
  });
});

describe("directionForTurn", () => {
  it("correctly handles left turns not through north", () => {
    expect(
      directionForTurn(HeadingSchema.make(30))(HeadingSchema.make(60))
    ).toEqual(Option.some("Right"));
  });

  it("correctly handles left turns not through north", () => {
    expect(
      directionForTurn(HeadingSchema.make(330))(HeadingSchema.make(20))
    ).toEqual(Option.some("Right"));
  });

  it("correctly handles left turns through north", () => {
    expect(
      directionForTurn(HeadingSchema.make(70))(HeadingSchema.make(350))
    ).toEqual(Option.some("Left"));
  });

  it("correctly handles left turns through north", () => {
    expect(
      directionForTurn(HeadingSchema.make(270))(HeadingSchema.make(10))
    ).toEqual(Option.some("Right"));
  });

  it("correctly handles course reversals", () => {
    expect(
      directionForTurn(HeadingSchema.make(270))(HeadingSchema.make(90))
    ).toEqual(Option.none());
  });
});

describe("headingChangeAmount", () => {
  test("normal turn", () => {
    expect(
      headingChangeAmount(HeadingSchema.make(250))(HeadingSchema.make(230))
    ).toEqual(20);
  });

  test("course reversal", () => {
    expect(
      headingChangeAmount(HeadingSchema.make(260))(HeadingSchema.make(80))
    ).toEqual(180);
  });
});

describe("isInHeadingRange", () => {
  it("should return true for a heading inside a right range that crosses 360 (from 350 to 10 going right)", () => {
    expect(
      headingRangeContains({
        from: HeadingSchema.make(350),
        to: HeadingSchema.make(10),
        direction: "Right",
      })(HeadingSchema.make(359))
    ).toBe(true);
  });

  it("should return false for a heading outside a right range that crosses 360 (from 350 to 10 going right)", () => {
    expect(
      headingRangeContains({
        from: HeadingSchema.make(350),
        to: HeadingSchema.make(10),
        direction: "Right",
      })(HeadingSchema.make(180))
    ).toBe(false);
  });

  it("should return true for a heading inside a left range not crossing 360 (from 100 to 70 going right)", () => {
    expect(
      headingRangeContains({
        from: HeadingSchema.make(100),
        to: HeadingSchema.make(70),
        direction: "Left",
      })(HeadingSchema.make(90))
    ).toBe(true);
  });

  it("should return false for a heading outside that left range (from 100 to 70 going left)", () => {
    expect(
      headingRangeContains({
        from: HeadingSchema.make(100),
        to: HeadingSchema.make(70),
        direction: "Left",
      })(HeadingSchema.make(50))
    ).toBe(false);
  });

  it("should handle an acute angle (from 30° to 60° going right)", () => {
    const range = {
      from: HeadingSchema.make(30),
      to: HeadingSchema.make(60),
      direction: "Right",
    } as const;

    expect(headingRangeContains(range)(HeadingSchema.make(45))).toBe(true);
    expect(headingRangeContains(range)(HeadingSchema.make(25))).toBe(false);
  });

  it("should handle an obtuse angle (from 30° to 150° going right)", () => {
    const range = {
      from: HeadingSchema.make(30),
      to: HeadingSchema.make(150),
      direction: "Right",
    } as const;

    expect(headingRangeContains(range)(HeadingSchema.make(90))).toBe(true);
    expect(headingRangeContains(range)(HeadingSchema.make(200))).toBe(false);
  });

  it("should handle a range larger than 180 degrees (from 100° to 300° going right)", () => {
    const range = {
      from: HeadingSchema.make(100),
      to: HeadingSchema.make(300),
      direction: "Right",
    } as const;

    expect(headingRangeContains(range)(HeadingSchema.make(200))).toBe(true);
    expect(headingRangeContains(range)(HeadingSchema.make(80))).toBe(false);
  });

  it("should handle exactly 180 degrees difference, where directionForTurn returns none", () => {
    expect(
      headingRangeContains({
        from: HeadingSchema.make(100),
        to: HeadingSchema.make(280),
        direction: "Right",
      })(HeadingSchema.make(190))
    ).toBe(true);
  });

  test("observed logic error", () => {
    expect(
      headingRangeContains({
        from: HeadingSchema.make(90),
        to: HeadingSchema.make(340),
        direction: "Left",
      })(HeadingSchema.make(270))
    ).toBeFalse();
  });
});

describe("RandomHeading", () => {
  test("random heading", async () => {
    const results: ReadonlyArray<Effect.Effect<Heading, Error, never>> =
      Array(100).fill(RandomHeading);
    const x = Effect.forEach(results, identity).pipe(Effect.either);
    console.log(Effect.runSync(x));
  });
});

describe("getCardinalDirection", () => {
  it("should return North for 0° and 360°", () => {
    const heading360 = HeadingSchema.make(360);
    expect(getCardinalDirection(heading360)).toBe("North");
  });

  it("should return Northeast for headings between 22.5° and 67.5°", () => {
    const headings = [30, 45, 60];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("Northeast");
    });
  });

  it("should return East for headings between 67.5° and 112.5°", () => {
    const headings = [90, 80, 110];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("East");
    });
  });

  it("should return Southeast for headings between 112.5° and 157.5°", () => {
    const headings = [120, 135, 150];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("Southeast");
    });
  });

  it("should return South for headings between 157.5° and 202.5°", () => {
    const headings = [180, 170, 200];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("South");
    });
  });

  it("should return Southwest for headings between 202.5° and 247.5°", () => {
    const headings = [220, 225, 240];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("Southwest");
    });
  });

  it("should return West for headings between 247.5° and 292.5°", () => {
    const headings = [270, 260, 290];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("West");
    });
  });

  it("should return Northwest for headings between 292.5° and 337.5°", () => {
    const headings = [300, 315, 330];
    headings.forEach((degrees) => {
      const heading = HeadingSchema.make(degrees);
      expect(getCardinalDirection(heading)).toBe("Northwest");
    });
  });
});
