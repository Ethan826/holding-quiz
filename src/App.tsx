// App.tsx

import "./App.css";
import { DirectionalGyro } from "./DirectionalGyro/DirectionalGyro";
import { CompassConfigProps } from "./DirectionalGyro/CompassConfigProps";
import { generateHoldingScenarioEffect, Hold, HoldEntry } from "./Hold";
import { Effect } from "effect";
import { getCardinalDirection, reverseCourse } from "./Heading";
import { useEffect, useState } from "react";

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

// HoldingInstructions.tsx

interface HoldingInstructionsProps {
  hold: Hold;
}

// HoldingInstructions.tsx

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

const App: React.FC = () => {
  const [holdingScenario, setHoldingScenario] = useState<{
    hold: Hold;
    courseToFix: number;
    solution: ReadonlySet<HoldEntry>;
  } | null>(null);

  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);

  // Function to generate a new holding scenario
  const generateNewHoldingScenario = () => {
    try {
      const newScenario = Effect.runSync(generateHoldingScenarioEffect);
      setHoldingScenario(newScenario);
      setIsSolutionRevealed(false); // Reset solution visibility
    } catch (error) {
      console.error("Failed to generate a new holding scenario:", error);
      // Optionally, set an error state and display an error message to the user
    }
  };

  // Initialize holding scenario on component mount
  useEffect(() => {
    generateNewHoldingScenario();
  }, []);

  // Handle loading state
  if (!holdingScenario) {
    return (
      <div className="app-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  const { hold, courseToFix, solution } = holdingScenario;

  // Function to toggle solution visibility
  const toggleSolution = () => {
    setIsSolutionRevealed((prev) => !prev);
  };

  return (
    <div className="app-container">
      {/* User Assumption Instruction */}
      <UserAssumption heading={courseToFix} />

      {/* ATC Holding Instructions */}
      <HoldingInstructions hold={hold} />

      {/* Compass Display */}
      <div className="compass-container">
        <DirectionalGyro
          heading={courseToFix}
          {...COMPASS_PROPS}
          aria-label="Directional Compass"
        />
      </div>

      {/* Solution Reveal */}
      <SolutionReveal
        solution={solution}
        isRevealed={isSolutionRevealed}
        toggleSolution={toggleSolution}
      />

      {/* New Problem Button */}
      <button
        className="new-problem-button"
        onClick={generateNewHoldingScenario}
      >
        Create New Problem
      </button>
    </div>
  );
};

export default App;

// SolutionReveal.tsx

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

interface UserAssumptionProps {
  heading: number;
}

export const UserAssumption: React.FC<UserAssumptionProps> = () => {
  return (
    <div className="user-assumption-container">
      <p className="user-assumption-text">
        Assume you are direct to the fix on the heading indicated by the heading
        indicator.
      </p>
    </div>
  );
};
