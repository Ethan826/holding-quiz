import { describe, it, expect } from "bun:test";
import {
  decodeDurationSeconds,
  decodeDistanceDecimiles,
  decodeHold,
  Hold,
  DurationSecondsSchema,
  determineHoldEntry,
} from "./Hold";
import { HeadingSchema } from "./Heading";

describe("Schema Tests", () => {
  describe("Second Schema", () => {
    it("should decode valid seconds correctly", () => {
      const result = decodeDurationSeconds(30);
      expect(result._tag).toBe("Right");
    });

    it("should reject negative seconds", () => {
      const result = decodeDurationSeconds(-1);
      expect(result._tag).toBe("Left");
    });
  });

  describe("Decimile Schema", () => {
    it("should decode valid decimiles correctly", () => {
      const result = decodeDistanceDecimiles(10);
      expect(result._tag).toBe("Right");
    });

    it("should reject negative decimiles", () => {
      const result = decodeDistanceDecimiles(-5);
      expect(result._tag).toBe("Left");
    });
  });

  describe("Holding Patterns", () => {
    it("should decode a valid time-based hold", () => {
      const hold = {
        _tag: "TimeBasedLeg",
        fix: "RDU",
        inboundCourse: 180,
        durationSeconds: 5,
        direction: "Left",
        efcMinutes: 33,
      };
      const result = decodeHold(hold);
      expect(result._tag).toBe("Right");
    });

    it("should decode a valid decimile-based hold", () => {
      const hold = {
        _tag: "DistanceBasedLeg",
        distanceDecimiles: 15,
        fix: "GSO",
        inboundCourse: 360,
        direction: "Right",
        efcMinutes: 18,
      };
      const result = decodeHold(hold);
      expect(result._tag).toBe("Right");
    });

    it("should reject a hold with invalid inbound course", () => {
      const hold = {
        _tag: "DecimileBasedLeg",
        distance: 20,
        turns: "Right",
        inboundCourse: 361, // Invalid course
      };
      const result = decodeHold(hold);
      expect(result._tag).toBe("Left");
    });
  });
});

describe("computeHoldEntry", () => {
  // it("correctly determines a direct entry with right turns", () => {
  //   const hold: Hold = {
  //     _tag: "TimeBasedLeg",
  //     fix: "RDU",
  //     inboundCourse: HeadingSchema.make(270),
  //     time: SecondSchema.make(60),
  //     turns: "Right",
  //   };

  //   const result = computeEntry(hold)(HeadingSchema.make(270));
  //   expect(result).toEqual(new Set([{ _tag: "Direct" }]));
  // });

  // it("correctly determines a teardrop entry with right turns", () => {
  //   const hold: Hold = {
  //     _tag: "TimeBasedLeg",
  //     fix: "RDU",
  //     inboundCourse: HeadingSchema.make(30),
  //     time: SecondSchema.make(60),
  //     turns: "Right",
  //   };

  //   const result = computeEntry(hold)(HeadingSchema.make(180));
  //   expect(result).toEqual(new Set([{ _tag: "Teardrop" }]));
  // });

  // it("correctly determines a parallel entry with right turns", () => {
  //   const hold: Hold = {
  //     _tag: "TimeBasedLeg",
  //     fix: "RDU",
  //     inboundCourse: HeadingSchema.make(30),
  //     time: SecondSchema.make(60),
  //     turns: "Right",
  //   };

  //   const result = computeEntry(hold)(HeadingSchema.make(250));
  //   expect(result).toEqual(new Set([{ _tag: "Parallel" }]));
  // });

  it("correctly determines a direct entry with left turns", () => {
    const hold: Hold = {
      _tag: "TimeBasedLeg",
      fix: "RDU",
      inboundCourse: HeadingSchema.make(270),
      durationSeconds: DurationSecondsSchema.make(60),
      direction: "Left",
      efcMinutes: 11,
    };

    const result = determineHoldEntry(hold)(HeadingSchema.make(270));
    expect(result).toEqual(new Set([{ _tag: "DirectEntry" }]));
  });

  it("correctly determines a teardrop entry with left turns", () => {
    const hold: Hold = {
      _tag: "TimeBasedLeg",
      fix: "RDU",
      inboundCourse: HeadingSchema.make(270),
      durationSeconds: DurationSecondsSchema.make(60),
      direction: "Left",
      efcMinutes: 22,
    };

    const result = determineHoldEntry(hold)(HeadingSchema.make(140));
    expect(result).toEqual(new Set([{ _tag: "TeardropEntry" }]));
  });

  it("correctly determines a parallel entry with left turns", () => {
    const hold: Hold = {
      _tag: "TimeBasedLeg",
      fix: "RDU",
      inboundCourse: HeadingSchema.make(270),
      durationSeconds: DurationSecondsSchema.make(60),
      direction: "Left",
      efcMinutes: 33,
    };

    const result = determineHoldEntry(hold)(HeadingSchema.make(50));
    expect(result).toEqual(new Set([{ _tag: "ParallelEntry" }]));
  });
});
