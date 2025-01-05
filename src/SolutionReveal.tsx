import { HoldEntry } from "./Hold";

interface SolutionRevealProps {
  solution: ReadonlySet<HoldEntry>;
  isRevealed: boolean;
  toggleSolution: () => void;
}
/**
 * Maps HoldEntry _tag values to user-friendly strings.
 *
 * @param tag - The _tag value from HoldEntry.
 * @returns A readable string representing the hold entry.
 */
const mapHoldEntryTagToString = (tag: string): string => {
  // Insert a space before each uppercase letter (except the first) and capitalize the first letter
  return tag.replace(/([A-Z])/g, " $1").trim();
};

export const SolutionReveal: React.FC<SolutionRevealProps> = ({
  solution,
  isRevealed,
  toggleSolution,
}) => {
  // Convert solution set to array and map tags to readable strings
  const solutionEntries = Array.from(solution).map((entry) =>
    mapHoldEntryTagToString(entry._tag)
  );

  return (
    <div className="solution-reveal-container">
      <button className="reveal-button" onClick={toggleSolution}>
        {isRevealed ? "Hide Correct Entry" : "Show Correct Entry"}
      </button>
      {isRevealed && (
        <div className="solution-container">
          <h2 className="solution-title">Correct Entry:</h2>
          <ul className="solution-list">
            {solutionEntries.map((entry, index) => (
              <li key={index} className="solution-item">
                {entry}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
