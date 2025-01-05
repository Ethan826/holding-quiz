import { Schema } from "effect";

export const DirectionSchema = Schema.Union(
  Schema.Literal("Left"),
  Schema.Literal("Right")
);

export type Direction = Schema.Schema.Type<typeof DirectionSchema>;
