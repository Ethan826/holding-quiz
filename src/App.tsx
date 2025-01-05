import "./App.css";
import { DirectionalGyro } from "./DirectionalGyro/DirectionalGyro";
import { CompassConfigProps } from "./DirectionalGyro/CompassConfigProps";
import { generateHoldingScenarioEffect, Hold, HoldEntry } from "./Hold";
import { Effect } from "effect";
import { useEffect, useState } from "react";
import { HoldingInstructions } from "./HoldingInstructions";
import { SolutionReveal } from "./SolutionReveal";
import { UserAssumption } from "./UserAssumption";

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

const App: React.FC = () => {
  const [holdingScenario, setHoldingScenario] = useState<{
    hold: Hold;
    courseToFix: number;
    solution: ReadonlySet<HoldEntry>;
  } | null>(null);

  console.log(
    `Hold definition: ${JSON.stringify(holdingScenario?.hold, null, 2)}`,
    `Course to fix: ${holdingScenario?.courseToFix}.`,
    `Solution(s): ${JSON.stringify([...(holdingScenario?.solution ?? [])])}`
  );

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
