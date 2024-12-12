import { CompassProps } from "./CompassProps";

export const CompassRoseCircle: React.FC<CompassProps> = ({
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
