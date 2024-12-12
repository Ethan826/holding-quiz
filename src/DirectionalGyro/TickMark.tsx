import { CompassConfigProps } from "./CompassConfigProps";
import { calculatePosition } from "./calculatePosition";

type TickMarkProps = CompassConfigProps & {
  angle: number; // Compass angle (0–360, clockwise, 360 = North)
};

export const TickMark: React.FC<TickMarkProps> = ({
  cx,
  cy,
  radius,
  strokeWidth,
  angle,
  cardinalTickLength,
  majorTickLength,
  minorTickLength,
}) => {
  const tickLength =
    angle % 90 === 0
      ? cardinalTickLength
      : angle % 30 === 0
      ? majorTickLength
      : minorTickLength;

  const start = calculatePosition(cx, cy, radius, angle);
  const end = calculatePosition(cx, cy, radius - tickLength, angle);

  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke="black"
      strokeWidth={strokeWidth}
    />
  );
};
