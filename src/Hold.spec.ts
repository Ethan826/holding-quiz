import { describe, it, expect } from "bun:test";
import {
  secondDecodeUnknownEither,
  decimileDecodeUnknownEither,
  holdDecodeUnknownEither,
  Hold,
  SecondSchema,
  computeEntry,
} from "./Hold";
import { HeadingSchema } from "./Heading";

describe("Schema Tests", () => {
  describe("Second Schema", () => {
    it("should decode valid seconds correctly", () => {
      const result = secondDecodeUnknownEither(30);
      expect(result._tag).toBe("Right");
    });

    it("should reject negative seconds", () => {
      const result = secondDecodeUnknownEither(-1);
      expect(result._tag).toBe("Left");
    });
  });

  describe("Decimile Schema", () => {
    it("should decode valid decimiles correctly", () => {
      const result = decimileDecodeUnknownEither(10);
      expect(result._tag).toBe("Right");
    });

    it("should reject negative decimiles", () => {
      const result = decimileDecodeUnknownEither(-5);
      expect(result._tag).toBe("Left");
    });
  });

  describe("Holding Patterns", () => {
    it("should decode a valid time-based hold", () => {
      const hold = {
        _tag: "TimeBasedLeg",
        fix: "RDU",
        inboundCourse: 180,
        time: 5,
        turns: "Left",
      };
      const result = holdDecodeUnknownEither(hold);
      expect(result._tag).toBe("Right");
    });

    it("should decode a valid decimile-based hold", () => {
      const hold = {
        _tag: "DecimileBasedLeg",
        distance: 15,
        fix: "GSO",
        inboundCourse: 360,
        turns: "Right",
      };
      const result = holdDecodeUnknownEither(hold);
      expect(result._tag).toBe("Right");
    });

    it("should reject a hold with invalid inbound course", () => {
      const hold = {
        _tag: "DecimileBasedLeg",
        distance: 20,
        turns: "Right",
        inboundCourse: 361, // Invalid course
      };
      const result = holdDecodeUnknownEither(hold);
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
      time: SecondSchema.make(60),
      turns: "Left",
    };

    const result = computeEntry(hold)(HeadingSchema.make(270));
    expect(result).toEqual(new Set([{ _tag: "Direct" }]));
  });

  // it("correctly determines a teardrop entry with left turns", () => {
  //   const hold: Hold = {
  //     _tag: "TimeBasedLeg",
  //     fix: "RDU",
  //     inboundCourse: HeadingSchema.make(270),
  //     time: SecondSchema.make(60),
  //     turns: "Left",
  //   };

  //   const result = computeEntry(hold)(HeadingSchema.make(140));
  //   expect(result).toEqual(new Set([{ _tag: "Teardrop" }]));
  // });

  // it("correctly determines a parallel entry with left turns", () => {
  //   const hold: Hold = {
  //     _tag: "TimeBasedLeg",
  //     fix: "RDU",
  //     inboundCourse: HeadingSchema.make(270),
  //     time: SecondSchema.make(60),
  //     turns: "Left",
  //   };

  //   const result = computeEntry(hold)(HeadingSchema.make(50));
  //   expect(result).toEqual(new Set([{ _tag: "Parallel" }]));
  // });
});
