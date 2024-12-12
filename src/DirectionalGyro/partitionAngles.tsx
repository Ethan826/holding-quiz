import { Array } from "effect";

export const partitionAngles = (start: number, end: number) => {
  return Array.range(start, end)
    .map((i) => i * 10)
    .reduce(
      (acc, angle) => {
        if (angle % 90 === 0) {
          acc.cardinalAngles.push(angle);
        } else if (angle % 30 === 0) {
          acc.majorAngles.push(angle);
        } else {
          acc.minorAngles.push(angle);
        }
        return acc;
      },
      {
        cardinalAngles: [] as number[],
        majorAngles: [] as number[],
        minorAngles: [] as number[],
      }
    );
};
