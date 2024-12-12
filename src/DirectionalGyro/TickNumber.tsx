import { CompassConfigProps } from "./CompassConfigProps";
import { calculatePosition } from "./calculatePosition";

type TickNumberProps = CompassConfigProps & {
  angle: number; // Angle of the tick mark
  label: string; // The number or label to display
};

export const TickNumber: React.FC<TickNumberProps> = ({
  cx,
  cy,
  radius,
  angle,
  label,
  cardinalTickLength,
  majorTickLength,
}) => {
  const offset = cardinalTickLength + majorTickLength;
  const position = calculatePosition(cx, cy, radius - offset, angle);

  return (
    <text
      x={position.x}
      y={position.y}
      fontSize="8"
      textAnchor="middle"
      alignmentBaseline="middle"
      fill="black"
      transform={`rotate(${angle} ${position.x} ${position.y})`}
    >
      {label}
    </text>
  );
};
