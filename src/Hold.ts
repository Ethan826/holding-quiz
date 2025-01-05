import { faker } from "@faker-js/faker";
import { Effect, Match, Random, Schema } from "effect";
import {
  addHeadings,
  Heading,
  headingRangeContains,
  HeadingSchema,
  RandomHeading,
  reverseCourse,
  subtractHeadings,
} from "./Heading";
import { constant, pipe } from "effect/Function";
import { NoSuchElementException } from "effect/Cause";
import { Direction } from "./Direction";

/**
 * A branded schema for representing duration in seconds as a non-negative
 * integer.  The brand is "DurationSeconds" to distinguish this type from other
 * numeric types.
 */
export const DurationSecondsSchema = Schema.Int.pipe(
  Schema.nonNegative(),
  Schema.brand("DurationSeconds")
);

/**
 * A type representing the result of decoding a duration in seconds. See
 * `DurationSecondsSchema`.
 */
export type DurationSeconds = Schema.Schema.Type<typeof DurationSecondsSchema>;

/**
 * A utility for decoding an unknown value into a `DurationSeconds`-branded
 * integer.
 */
export const decodeDurationSeconds = Schema.decodeUnknownEither(
  DurationSecondsSchema
);

/**
 * A branded schema for representing distances in decimiles as a non-negative
 * integer. The brand is "DistanceDecimiles" to distinguish this type from
 * other numeric types.
 */
export const DistanceDecimilesSchema = Schema.Int.pipe(
  Schema.nonNegative(),
  Schema.brand("DistanceDecimiles")
);

/**
 * A type representing the result of decoding a distance in decimiles. See
 * `DistanceDecimilesSchema`.
 */
export type DistanceDecimiles = Schema.Schema.Type<
  typeof DistanceDecimilesSchema
>;

/**
 * A utility for decoding an unknown value into a `DistanceDecimiles`-branded
 * integer.
 */
export const decodeDistanceDecimiles = Schema.decodeUnknownEither(
  DistanceDecimilesSchema
);

/**
 * A schema for the direction of a holding pattern. Supported values are either
 * "Left" or "Right".
 */
export const HoldingDirectionSchema = Schema.Union(
  Schema.Literal("Left"),
  Schema.Literal("Right")
);

/**
 * Represents the direction of a holding pattern. Can be either "Left" or
 * "Right".
 */
export type HoldingDirection = Schema.Schema.Type<
  typeof HoldingDirectionSchema
>;

/** A tagged schema for a time-based holding pattern leg. */
export const TimeBasedHoldSchema = Schema.TaggedStruct("TimeBasedLeg", {
  fix: Schema.String,
  inboundCourse: HeadingSchema,
  durationSeconds: DurationSecondsSchema,
  direction: HoldingDirectionSchema,
  efcMinutes: Schema.Int.pipe(Schema.nonNegative()),
});
export type TimeBasedHold = Schema.Schema.Type<typeof TimeBasedHoldSchema>;

/** A tagged schema for a distance-based holding pattern leg. */
export const DistanceBasedHoldSchema = Schema.TaggedStruct("DistanceBasedLeg", {
  distanceDecimiles: DistanceDecimilesSchema,
  fix: Schema.String,
  inboundCourse: HeadingSchema,
  direction: HoldingDirectionSchema,
  efcMinutes: Schema.Int.pipe(Schema.nonNegative()),
});
export type DistanceBasedHold = Schema.Schema.Type<
  typeof DistanceBasedHoldSchema
>;

/**
 * A union schema that captures either a time-based or distance-based holding
 * pattern.
 */
export const HoldSchema = Schema.Union(
  TimeBasedHoldSchema,
  DistanceBasedHoldSchema
);

/** Represents either a `TimeBasedLeg` or a `DistanceBasedLeg`. */
export type Hold = Schema.Schema.Type<typeof HoldSchema>;

/** A utility for decoding an unknown value into a `Hold`. */
export const decodeHold = Schema.decodeUnknownEither(HoldSchema);

export const HoldEntrySchema = Schema.Union(
  Schema.TaggedStruct("DirectEntry", {}),
  Schema.TaggedStruct("TeardropEntry", {}),
  Schema.TaggedStruct("ParallelEntry", {})
);

/** Represents the possible holding pattern entry types. */
export type HoldEntry = Schema.Schema.Type<typeof HoldEntrySchema>;

/**
 * Creates a `HoldEntry` tagged as "Direct".
 */
export const createDirectEntry: () => HoldEntry = constant({
  _tag: "DirectEntry",
});

/**
 * Creates a `HoldEntry` tagged as "Teardrop".
 */
export const createTeardropEntry: () => HoldEntry = constant({
  _tag: "TeardropEntry",
});

/**
 * Creates a `HoldEntry` tagged as "Parallel".
 */
export const createParallelEntry: () => HoldEntry = constant({
  _tag: "ParallelEntry",
});

/**
 * A set of boundary headings used for determining which type of entry applies
 * based on the inbound course.
 */
type EntryBoundaries = Readonly<{
  parallelDirect: Heading;
  teardropDirect: Heading;
  teardropParallel: Heading;
}>;

/**
 * Computes the boundary headings used to determine the hold entry type.
 *
 * @param hold A holding pattern definition (time- or distance-based).
 * @returns The boundary headings.
 */
const computeEntryBoundaries = ({
  inboundCourse,
  direction,
}: Hold): EntryBoundaries => {
  // Determine whether to add or subtract 70° based on hold direction
  const adjustHeading = direction === "Right" ? subtractHeadings : addHeadings;

  // Boundary between Direct and other entries
  const parallelDirect = adjustHeading(inboundCourse)(HeadingSchema.make(70));

  // TeardropDirect is the reverse of parallelDirect
  const teardropDirect = reverseCourse(parallelDirect);

  // TeardropParallel is the reverse of inboundCourse
  const teardropParallel = reverseCourse(inboundCourse);

  return { parallelDirect, teardropDirect, teardropParallel };
};

/**
 * Checks if a given heading falls within the "Direct" sector of a holding
 * pattern.
 *
 * @param boundaries The precomputed boundary headings.
 * @returns A function that takes the hold direction and returns another
 * function to check the heading.
 */
const isHeadingDirect =
  ({ parallelDirect, teardropDirect }: EntryBoundaries) =>
  (direction: HoldingDirection) =>
    headingRangeContains({
      from: parallelDirect,
      to: teardropDirect,
      direction,
    });

/**
 * Checks if a given heading falls within the "Teardrop" sector of a holding
 * pattern.
 *
 * @param boundaries The precomputed boundary headings.
 * @returns A function that takes the hold direction and returns another
 * function to check the heading.
 */
const isHeadingTeardrop =
  ({ teardropParallel, teardropDirect }: EntryBoundaries) =>
  (direction: HoldingDirection) =>
    headingRangeContains({
      from: teardropDirect,
      to: teardropParallel,
      direction,
    });

/**
 * Checks if a given heading falls within the "Parallel" sector of a holding
 * pattern.
 *
 * @param boundaries The precomputed boundary headings.
 * @returns A function that takes the hold direction and returns another
 * function to check the heading.
 */
const isHeadingParallel =
  ({ teardropParallel, parallelDirect }: EntryBoundaries) =>
  (direction: HoldingDirection) =>
    headingRangeContains({
      from: teardropParallel,
      to: parallelDirect,
      direction,
    });

/**
 * Determines which hold entry or entries apply for a given hold and inbound
 * heading.
 *
 * @param hold The holding pattern definition (time- or distance-based).
 * @returns A function that takes a `Heading` and returns a `ReadonlySet<HoldEntry>`.
 *
 * Usage example:
 * ```
 * // entry is a set of possible HoldEntries (Direct, Teardrop, or Parallel)
 * const entry = determineHoldEntry(myHold)(myHeading);
 * ```
 */
export const determineHoldEntry =
  (hold: Hold) =>
  (headingToFix: Heading): ReadonlySet<HoldEntry> => {
    const { direction } = hold;
    const boundaries = computeEntryBoundaries(hold);

    // List of entry checkers associated with their respective entry creators
    return (
      [
        [isHeadingDirect, createDirectEntry],
        [isHeadingTeardrop, createTeardropEntry],
        [isHeadingParallel, createParallelEntry],
      ] as const
    ).reduce((result, [entryChecker, createEntry]) => {
      if (entryChecker(boundaries)(direction)(headingToFix)) {
        result.add(createEntry());
      }
      return result;
    }, new Set<HoldEntry>());
  };

const generateIntersectionName = Effect.sync(() =>
  faker.word.noun({ length: { min: 5, max: 5 } }).toUpperCase()
);

const toTitleCase = (word: string) =>
  word.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

const generateVorName = pipe(
  () => faker.word.noun(),
  Effect.sync,
  Effect.map(toTitleCase),
  Effect.map((name) => `${name} VOR`)
);

const generateFixName = pipe(
  [generateIntersectionName, generateVorName],
  Random.choice,
  Effect.flatten
);

const randomTurnDirectionEffect: Effect.Effect<
  Direction,
  NoSuchElementException,
  never
> = Random.choice(["Left", "Right"] as const);

const randomHoldDurationEffect: Effect.Effect<
  DurationSeconds,
  NoSuchElementException,
  never
> = Random.choice([
  DurationSecondsSchema.make(60),
  DurationSecondsSchema.make(60),
  DurationSecondsSchema.make(60),
  DurationSecondsSchema.make(60),
  DurationSecondsSchema.make(60),
  DurationSecondsSchema.make(60),
  DurationSecondsSchema.make(90),
  DurationSecondsSchema.make(90),
  DurationSecondsSchema.make(120),
]);

const randomHoldDistanceEffect: Effect.Effect<
  DistanceDecimiles,
  NoSuchElementException,
  never
> = Random.choice([
  DistanceDecimilesSchema.make(40),
  DistanceDecimilesSchema.make(40),
  DistanceDecimilesSchema.make(40),
  DistanceDecimilesSchema.make(40),
  DistanceDecimilesSchema.make(40),
  DistanceDecimilesSchema.make(50),
  DistanceDecimilesSchema.make(100),
]);

const holdLegOptions = [
  { distanceDecimiles: randomHoldDistanceEffect, _tag: "DistanceBasedLeg" },
  { durationSeconds: randomHoldDurationEffect, _tag: "TimeBasedLeg" },
] as const;

type HoldLegOption = (typeof holdLegOptions)[number];

/**
 * Randomly selects and generates a hold leg (either distance-based or
 * time-based).
 */
const generateRandomHoldLeg = pipe(
  holdLegOptions,
  Random.choice,
  Effect.flatMap(
    Match.type<HoldLegOption>().pipe(
      Match.tag("DistanceBasedLeg", ({ distanceDecimiles, _tag }) =>
        Effect.gen(function* () {
          const distance = yield* distanceDecimiles;
          return { _tag, distanceDecimiles: distance };
        })
      ),
      Match.tag("TimeBasedLeg", ({ durationSeconds, _tag }) =>
        Effect.gen(function* () {
          const duration = yield* durationSeconds;
          return { _tag, durationSeconds: duration };
        })
      ),
      Match.exhaustive
    )
  )
);

type HoldingPatternScenario = {
  hold: Hold;
  courseToFix: Heading;
  solution: ReadonlySet<HoldEntry>;
};

/**
 * Generates a holding pattern scenario, including the hold definition,
 * course to fix, and the set of applicable hold entries.
 */
export const generateHoldingScenarioEffect: Effect.Effect<
  HoldingPatternScenario,
  unknown,
  never
> = Effect.gen(function* () {
  const fix = yield* generateFixName;
  const inboundCourse = yield* RandomHeading;
  const courseToFix = yield* RandomHeading;
  const direction = yield* randomTurnDirectionEffect;
  const holdLeg = yield* generateRandomHoldLeg;
  const efcMinutes = yield* Random.nextIntBetween(1, 60);

  const hold = {
    ...holdLeg,
    fix,
    inboundCourse,
    direction,
    efcMinutes,
  } as const;

  return {
    hold,
    courseToFix,
    solution: determineHoldEntry(hold)(courseToFix),
  };
});
