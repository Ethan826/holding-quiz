import { Array } from "effect";
import "./App.css";

export type CompassProps = {
  cx: number; // Center X coordinate
  cy: number; // Center Y coordinate
  radius: number; // Radius of the compass
  strokeWidth: number; // Common stroke width for all elements
};

export type TickConfig = {
  cardinalTickLength: number; // Length of cardinal tick marks
  majorTickLength: number; // Length of major tick marks
  minorTickLength: number; // Length of minor tick marks
  tickFontSize: number; // Font size for tick numbers
  tickLabelOffset: number; // Offset for tick labels
};

export type CompassConfigProps = CompassProps & TickConfig;

const partitionAngles = (start: number, end: number) => {
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

const CompassRoseCircle: React.FC<CompassProps> = ({
  cx,
  cy,
  radius,
  strokeWidth,
}) => (
  <circle
    cx={cx}
    cy={cy}
    r={radius}
    stroke="black"
    strokeWidth={strokeWidth}
    fill="none"
  />
);

const calculatePosition = (
  cx: number,
  cy: number,
  radius: number,
  angle: number
) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = cx + radius * Math.cos(radians);
  const y = cy + radius * Math.sin(radians);
  return { x, y };
};

type TickMarkProps = CompassConfigProps & {
  angle: number; // Compass angle (0–360, clockwise, 360 = North)
};

const TickMark: React.FC<TickMarkProps> = ({
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

type MiniatureAirplaneProps = {
  cx: number; // Center X of the compass
  cy: number; // Center Y of the compass
  size: number; // Size of the airplane symbol (total wingspan)
  strokeWidth: number; // Stroke width for the airplane
};

const MiniatureAirplane: React.FC<MiniatureAirplaneProps> = ({
  cx,
  cy,
  size,
  strokeWidth,
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
        stroke="black"
        strokeWidth={strokeWidth}
      />
      {/* Fuselage (forward) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - fuselageLength}
        stroke="black"
        strokeWidth={strokeWidth}
      />
      {/* Empennage (vertical line) */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy + empennageLength}
        stroke="black"
        strokeWidth={strokeWidth}
      />
      {/* Empennage (horizontal stabilizer) */}
      <line
        x1={cx - empennageWidth / 2}
        y1={cy + empennageLength}
        x2={cx + empennageWidth / 2}
        y2={cy + empennageLength}
        stroke="black"
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

type TickNumberProps = CompassConfigProps & {
  angle: number; // Angle of the tick mark
  label: string; // The number or label to display
};

const TickNumber: React.FC<TickNumberProps> = ({
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

const COMPASS_PROPS: CompassConfigProps = {
  cx: 100,
  cy: 100,
  radius: 90,
  strokeWidth: 2,
  cardinalTickLength: 15,
  majorTickLength: 10,
  minorTickLength: 5,
  tickFontSize: 8,
  tickLabelOffset: 5,
};

type DirectionalGyroProps = {
  heading: number; // Heading in degrees (0–360)
};

const DirectionalGyro: React.FC<DirectionalGyroProps> = ({ heading }) => {
  const { cardinalAngles, majorAngles, minorAngles } = partitionAngles(1, 36);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      viewBox="0 0 200 200"
    >
      {/* Rotate the compass based on the heading */}
      <g
        transform={`rotate(${-heading} ${COMPASS_PROPS.cx} ${
          COMPASS_PROPS.cy
        })`}
      >
        {/* Main Circle */}
        <CompassRoseCircle {...COMPASS_PROPS} />

        {/* Cardinal Tick Marks */}
        {cardinalAngles.map((angle) => (
          <TickMark
            key={`cardinal-${angle}`}
            {...COMPASS_PROPS}
            angle={angle}
          />
        ))}

        {/* Major Tick Marks */}
        {majorAngles.map((angle) => (
          <TickMark key={`major-${angle}`} {...COMPASS_PROPS} angle={angle} />
        ))}

        {/* Minor Tick Marks */}
        {minorAngles.map((angle) => (
          <TickMark key={`minor-${angle}`} {...COMPASS_PROPS} angle={angle} />
        ))}

        {/* Numbers for Cardinal Tick Marks */}
        {cardinalAngles.map((angle) => (
          <TickNumber
            key={`number-cardinal-${angle}`}
            {...COMPASS_PROPS}
            angle={angle}
            label={angle.toString()}
          />
        ))}

        {/* Numbers for Major Tick Marks */}
        {majorAngles.map((angle) => (
          <TickNumber
            key={`number-major-${angle}`}
            {...COMPASS_PROPS}
            angle={angle}
            label={angle.toString()}
          />
        ))}
      </g>

      {/* Miniature Airplane (Fixed, Does Not Rotate) */}
      <MiniatureAirplane
        cx={COMPASS_PROPS.cx}
        cy={COMPASS_PROPS.cy}
        size={20}
        strokeWidth={2}
      />
    </svg>
  );
};
const App = () => {
  const heading = 60;
  return <DirectionalGyro heading={heading} />;
};

export default App;
