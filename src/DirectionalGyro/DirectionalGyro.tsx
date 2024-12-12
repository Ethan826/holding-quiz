import { TickConfig } from "./TickConfig";
import { TickMark } from "./TickMark";
import { TickNumber } from "./TickNumber";
import { CompassProps } from "./CompassProps";
import { MiniatureAirplane } from "./MiniatureAirplane";
import { partitionAngles } from "./partitionAngles";
import { CompassRoseCircle } from "./CompassRoseCircle";

export type DirectionalGyroProps = {
  heading: number; // Heading in degrees (0–360)
} & CompassProps &
  TickConfig;

export const DirectionalGyro: React.FC<DirectionalGyroProps> = (props) => {
  const { cardinalAngles, majorAngles, minorAngles } = partitionAngles(1, 36);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      viewBox="0 0 200 200"
    >
      {/* Rotate the compass based on the heading */}
      <g transform={`rotate(${-props.heading} ${props.cx} ${props.cy})`}>
        {/* Main Circle */}
        <CompassRoseCircle {...props} />

        {/* Cardinal Tick Marks */}
        {cardinalAngles.map((angle) => (
          <TickMark key={`cardinal-${angle}`} {...props} angle={angle} />
        ))}

        {/* Major Tick Marks */}
        {majorAngles.map((angle) => (
          <TickMark key={`major-${angle}`} {...props} angle={angle} />
        ))}

        {/* Minor Tick Marks */}
        {minorAngles.map((angle) => (
          <TickMark key={`minor-${angle}`} {...props} angle={angle} />
        ))}

        {/* Numbers for Cardinal Tick Marks */}
        {cardinalAngles.map((angle) => (
          <TickNumber
            key={`number-cardinal-${angle}`}
            {...props}
            angle={angle}
            label={angle.toString()}
          />
        ))}

        {/* Numbers for Major Tick Marks */}
        {majorAngles.map((angle) => (
          <TickNumber
            key={`number-major-${angle}`}
            {...props}
            angle={angle}
            label={angle.toString()}
          />
        ))}
      </g>

      {/* Miniature Airplane (Fixed, Does Not Rotate) */}
      <MiniatureAirplane
        cx={props.cx}
        cy={props.cy}
        size={20}
        strokeWidth={2}
        color="brown"
      />
    </svg>
  );
};
