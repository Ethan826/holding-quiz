import { Effect, Option, pipe, Random, Schema } from "effect";
import { Direction } from "./Direction";

export const HeadingSchema = Schema.Int.pipe(
  Schema.greaterThan(0),
  Schema.lessThanOrEqualTo(360),
  Schema.brand("Heading")
);

export type Heading = Schema.Schema.Type<typeof HeadingSchema>;

export const headingDecodeUnknownEither =
  Schema.decodeUnknownEither(HeadingSchema);

export const headingDecodeSync = Schema.decodeSync(HeadingSchema);

export const addHeadings =
  (h1: Heading) =>
  (h2: Heading): Heading => {
    const rawSum = (h1 + h2) % 360;
    const adjustedSum = rawSum === 0 ? 360 : rawSum;
    return HeadingSchema.make(adjustedSum);
  };

export const subtractHeadings =
  (h1: Heading) =>
  (h2: Heading): Heading => {
    const rawDifference = (h1 - h2 + 360) % 360;
    const adjustedDifference = rawDifference === 0 ? 360 : rawDifference;
    return HeadingSchema.make(adjustedDifference);
  };

export const directionForTurn =
  (fromHeading: Heading) =>
  (toHeading: Heading): Option.Option<Direction> => {
    if (fromHeading === addHeadings(toHeading)(HeadingSchema.make(180))) {
      return Option.none();
    } else if (subtractHeadings(fromHeading)(toHeading) > 180) {
      return Option.some("Right");
    } else {
      return Option.some("Left");
    }
  };

export const headingChangeAmount =
  (fromHeading: Heading) =>
  (toHeading: Heading): number =>
    pipe(toHeading, subtractHeadings(fromHeading), (raw) =>
      raw === 180 ? 180 : raw % 180
    );

export const reverseCourse = addHeadings(HeadingSchema.make(180));

export type HeadingRange = {
  from: Heading;
  to: Heading;
  direction: Direction;
};

export const headingRangeContains =
  ({ from, to, direction }: HeadingRange) =>
  (checkDeg: Heading): boolean =>
    direction === "Right"
      ? subtractHeadings(checkDeg)(from) <= subtractHeadings(to)(from)
      : subtractHeadings(from)(checkDeg) <= subtractHeadings(from)(to);

export const RandomHeading = pipe(
  Random.nextIntBetween(1, 360),
  Effect.flatMap(Schema.decode(HeadingSchema)),
  Effect.mapError(
    (e) => new Error(`Creation of random heading failed: ${e.message}`)
  )
);
