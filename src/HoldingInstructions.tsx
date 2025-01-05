import { getCardinalDirection, reverseCourse } from "./Heading";
import { Hold } from "./Hold";

interface HoldingInstructionsProps {
  hold: Hold;
}

export const HoldingInstructions: React.FC<HoldingInstructionsProps> = ({
  hold,
}) => {
  // Construct the ATC holding instruction
  const instructions = `Hold ${getCardinalDirection(
    reverseCourse(hold.inboundCourse)
  )} of ${hold.fix} on the ${reverseCourse(hold.inboundCourse)}º radial, ${
    hold.direction
  } turns, ${
    hold._tag === "DistanceBasedLeg"
      ? `${hold.distanceDecimiles / 10} mile`
      : `${hold.durationSeconds / 60} minute`
  } legs, expect further clearance in ${hold.efcMinutes} minutes.`;

  return (
    <div className="holding-instructions-container">
      <h1 className="holding-instructions-title">ATC Holding Instructions</h1>
      <p className="holding-instructions-text">{instructions}</p>
    </div>
  );
};
