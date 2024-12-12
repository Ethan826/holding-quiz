export const calculatePosition = (
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
