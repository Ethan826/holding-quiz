import { faker } from "@faker-js/faker";
import { Console, Effect, Match, Random, Schema } from "effect";
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

/**
 * A branded schema for representing seconds as a non-negative integer.
 * The brand is "Second" to distinguish this type from other numeric types.
 */
export const SecondSchema = Schema.Int.pipe(
  Schema.nonNegative(),
  Schema.brand("Second")
);

/**
 * A type representing the result of decoding a second.
 * See `SecondSchema`.
 */
export type Second = Schema.Schema.Type<typeof SecondSchema>;

/**
 * A utility for decoding an unknown value into a `Second`-branded integer.
 */
export const secondDecodeUnknownEither =
  Schema.decodeUnknownEither(SecondSchema);

/**
 * A branded schema for representing distances in "decimiles" as a non-negative
 * integer. The brand is "Decimile" to distinguish this type from other numeric
 * types.
 */
export const DecimileSchema = Schema.Int.pipe(
  Schema.nonNegative(),
  Schema.brand("Decimile")
);

/**
 * A type representing the result of decoding a decimile distance.
 * See `DecimileSchema`.
 */
export type Decimile = Schema.Schema.Type<typeof DecimileSchema>;

/**
 * A utility for decoding an unknown value into a `Decimile`-branded integer.
 */
export const decimileDecodeUnknownEither =
  Schema.decodeUnknownEither(DecimileSchema);

/**
 * A schema for the direction of a holding pattern.
 * Supported values are either "Left" or "Right".
 */
export const DirectionSchema = Schema.Union(
  Schema.Literal("Left"),
  Schema.Literal("Right")
);

/**
 * Represents the direction of a holding pattern.
 * May be "Left" or "Right".
 */
export type Direction = Schema.Schema.Type<typeof DirectionSchema>;

/**
 * A tagged schema for a time-based holding pattern leg. It has a fix (string),
 * inbound course (heading), duration in seconds, and direction.
 */
export const TimeBasedHoldSchema = Schema.TaggedStruct("TimeBasedLeg", {
  fix: Schema.String,
  inboundCourse: HeadingSchema,
  time: SecondSchema,
  turns: DirectionSchema,
});
type TimeBasedHold = Schema.Schema.Type<typeof TimeBasedHoldSchema>;

/**
 * A tagged schema for a distance-based holding pattern leg. It has a distance
 * in decimiles (int), fix (string), inbound course (heading), and direction.
 */
export const DistanceBasedHoldSchema = Schema.TaggedStruct("DistanceBasedLeg", {
  distance: DecimileSchema,
  fix: Schema.String,
  inboundCourse: HeadingSchema,
  turns: DirectionSchema,
});
type DistanceBasedHold = Schema.Schema.Type<typeof DistanceBasedHoldSchema>;

/**
 * A union schema that captures either a time-based or distance-based holding
 * pattern.
 */
export const HoldSchema = Schema.Union(
  TimeBasedHoldSchema,
  DistanceBasedHoldSchema
);

/**
 * Represents either a `TimeBasedLeg` or a `DecimileBasedLeg`.
 */
export type Hold = Schema.Schema.Type<typeof HoldSchema>;

/**
 * A utility for decoding an unknown value into a `Hold`.
 */
export const holdDecodeUnknownEither = Schema.decodeUnknownEither(HoldSchema);

/**
 * Represents the possible holding pattern entries.
 */
export type HoldEntry =
  | Readonly<{ _tag: "Direct" }>
  | Readonly<{ _tag: "Teardrop" }>
  | Readonly<{ _tag: "Parallel" }>;

/**
 * Creates a `HoldEntry` tagged as "Direct".
 */
export const makeDirectEntry: () => HoldEntry = constant({ _tag: "Direct" });

/**
 * Creates a `HoldEntry` tagged as "Teardrop".
 */
export const makeTeardropEntry: () => HoldEntry = constant({
  _tag: "Teardrop",
});

/**
 * Creates a `HoldEntry` tagged as "Parallel".
 */
export const makeParallelEntry: () => HoldEntry = constant({
  _tag: "Parallel",
});

/**
 * A set of boundary headings used for dividing an inbound course
 * into segments that determine which type of entry (Direct, Teardrop,
 * or Parallel) applies.
 */
type EntryBoundaries = Readonly<{
  parallelDirect: Heading;
  teardropDirect: Heading;
  teardropParallel: Heading;
}>;

/**
 * Compute the three “boundary” headings used to decide
 * whether the hold entry is Direct, Teardrop, or Parallel.
 *
 * 1. `parallelDirect` is inboundCourse ± 70° (depending on hold direction).
 * 2. `teardropDirect` is the reverse of that boundary.
 * 3. `teardropParallel` is the reverse of the inbound course itself.
 *
 * @param hold A holding pattern definition (time- or distance-based).
 * @returns The boundary headings.
 */
const computeEntryBoundaries = ({
  inboundCourse,
  turns,
}: Hold): EntryBoundaries => {
  // Decide whether we add or subtract 70° for the "parallelDirect" boundary
  const addOrSubtract = turns === "Right" ? subtractHeadings : addHeadings;

  // The boundary that differentiates between Direct and other entries
  const parallelDirect = addOrSubtract(HeadingSchema.make(70))(inboundCourse);

  // The "teardropDirect" boundary is simply the reverse of that
  const teardropDirect = reverseCourse(parallelDirect);

  // The "teardropParallel" boundary is the reverse of the inbound course
  const teardropParallel = reverseCourse(inboundCourse);

  return { parallelDirect, teardropDirect, teardropParallel };
};

/**
 * A checker that returns true if a given heading falls
 * within the "Direct" sector of a holding pattern.
 *
 * @param boundaries The precomputed boundary headings.
 * @returns A function that takes the pattern direction and
 *          returns another function expecting the heading to check.
 */
const headingToFixIsDirect =
  ({ parallelDirect, teardropDirect }: EntryBoundaries) =>
  (turns: Direction) =>
    headingRangeContains({
      from: parallelDirect,
      to: teardropDirect,
      direction: turns,
    });

/**
 * A checker that returns true if a given heading falls
 * within the "Teardrop" sector of a holding pattern.
 *
 * @param boundaries The precomputed boundary headings.
 * @returns A function that takes the pattern direction and
 *          returns another function expecting the heading to check.
 */
const headingToFixIsTeardrop =
  ({ teardropParallel, teardropDirect }: EntryBoundaries) =>
  (turns: Direction) =>
    headingRangeContains({
      from: teardropDirect,
      to: teardropParallel,
      direction: turns,
    });

/**
 * A checker that returns true if a given heading falls
 * within the "Parallel" sector of a holding pattern.
 *
 * @param boundaries The precomputed boundary headings.
 * @returns A function that takes the pattern direction and
 *          returns another function expecting the heading to check.
 */
const headingToFixIsParallel =
  ({ teardropParallel, parallelDirect }: EntryBoundaries) =>
  (turns: Direction) =>
    headingRangeContains({
      from: teardropParallel,
      to: parallelDirect,
      direction: turns,
    });

/**
 * Determines which hold entry or entries apply for a given hold and inbound
 * heading.
 *
 * @param hold The holding pattern definition (time- or distance-based).
 * @returns A function that takes a `Heading` and returns a
 * `ReadonlySet<HoldEntry>`.
 *
 * Usage example:
 * ```
 * // entry is a set of possible HoldEntries (Direct, Teardrop, or Parallel)
 * const entry = computeEntry(myHold)(myHeading);
 * ```
 */
export const computeEntry =
  (hold: Hold) =>
  (courseToFix: Heading): ReadonlySet<HoldEntry> => {
    const { turns } = hold;
    const entryBoundaries = computeEntryBoundaries(hold);

    // A list of "entryCheckers" associated with the function that builds the
    // resulting entry. Each checker is partially applied with the boundaries
    // (and direction), so each returns true/false for whether `courseToFix`
    // falls in that sector.
    return (
      [
        [headingToFixIsDirect, makeDirectEntry],
        [headingToFixIsTeardrop, makeTeardropEntry],
        [headingToFixIsParallel, makeParallelEntry],
      ] as const
    ).reduce((result, [entryChecker, resultingEntry]) => {
      // If the checker says "yes, courseToFix is in my sector", we add that
      // entry type
      if (entryChecker(entryBoundaries)(turns)(courseToFix)) {
        result.add(resultingEntry());
      }
      return result;
    }, new Set<HoldEntry>());
  };

const IntersectionName = Effect.sync(() =>
  faker.word.noun({ length: { min: 5, max: 5 } }).toUpperCase()
);

const toTitleCase = (w: string) =>
  w.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

const VorName = pipe(
  () => faker.word.noun(),
  Effect.sync,
  Effect.map(toTitleCase),
  Effect.map((a) => `${a} VOR`)
);

const FixName = pipe(
  [IntersectionName, VorName],
  Random.choice,
  Effect.flatten
);

const RandomTurn: Effect.Effect<Direction, NoSuchElementException, never> =
  Random.choice(["Left", "Right"] as const);

const RandomTime: Effect.Effect<Second, NoSuchElementException, never> =
  Random.choice([
    SecondSchema.make(60),
    SecondSchema.make(60),
    SecondSchema.make(60),
    SecondSchema.make(60),
    SecondSchema.make(60),
    SecondSchema.make(60),
    SecondSchema.make(90),
    SecondSchema.make(90),
    SecondSchema.make(120),
  ]);

const RandomDistance: Effect.Effect<Decimile, NoSuchElementException, never> =
  Random.choice([
    DecimileSchema.make(40),
    DecimileSchema.make(40),
    DecimileSchema.make(40),
    DecimileSchema.make(40),
    DecimileSchema.make(40),
    DecimileSchema.make(50),
    DecimileSchema.make(100),
  ]);

type Foo =
  | (Pick<DistanceBasedHold, "_tag"> & {
      distance: Effect.Effect<Decimile, NoSuchElementException, never>;
    })
  | (Pick<TimeBasedHold, "_tag"> & {
      time: Effect.Effect<Second, NoSuchElementException, never>;
    });

const Foo = pipe(
  [
    { distance: RandomDistance, _tag: "DistanceBasedLeg" },
    { time: RandomTime, _tag: "TimeBasedLeg" },
  ] as const,
  Random.choice,
  Effect.flatMap(
    Match.type<Foo>().pipe(
      Match.tag("DistanceBasedLeg", ({ distance, _tag }) =>
        Effect.gen(function* () {
          const distance_ = yield* distance;
          return { _tag, distance: distance_ };
        })
      ),
      Match.tag("TimeBasedLeg", ({ time, _tag }) =>
        Effect.gen(function* () {
          const time_ = yield* time;
          return { _tag, time: time_ };
        })
      ),
      Match.exhaustive
    )
  )
);

type HoldingProblem = {
  hold: Hold;
  courseToFix: Heading;
  solution: ReadonlySet<HoldEntry>;
};

const foo: Effect.Effect<
  HoldingProblem,
  NoSuchElementException | Error,
  never
> = Effect.gen(function* () {
  const fix = yield* FixName;
  const inboundCourse = yield* RandomHeading;
  const courseToFix = yield* RandomHeading;
  const turns = yield* RandomTurn;
  const howFar = yield* Foo;

  const hold = {
    ...howFar,
    fix,
    inboundCourse,
    turns,
  } as const;

  return {
    hold,
    courseToFix,
    solution: computeEntry(hold)(courseToFix),
  };
});

pipe(foo, Effect.tap(Console.log), Effect.runSync);
