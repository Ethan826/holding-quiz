type MiniatureAirplaneProps = {
  cx: number; // Center X of the compass
  cy: number; // Center Y of the compass
  size: number; // Size of the airplane symbol (total wingspan)
  strokeWidth: number; // Stroke width for the airplane
  color: string;
};

export const MiniatureAirplane: React.FC<MiniatureAirplaneProps> = ({
  cx,
  cy,
  size,
  strokeWidth,
  color,
}) => {
  const halfSize = size / 2;
  const fuselageLength = size / 3; // Length of the fuselage
  const empennageWidth = size / 2; // Width of the empennage
  const empennageLength = size / 2; // Length of the empennage

  return (
    <g>
      {/* Wings */}
      <line
        x1={cx - halfSize}
        y1={cy}
        x2={cx + halfSize}
        y2={cy}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Fuselage (forward) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - fuselageLength}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Empennage (vertical line) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy + empennageLength}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Empennage (horizontal stabilizer) */}
      <line
        x1={cx - empennageWidth / 2}
        y1={cy + empennageLength}
        x2={cx + empennageWidth / 2}
        y2={cy + empennageLength}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};
