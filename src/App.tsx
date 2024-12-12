import "./App.css";
import { DirectionalGyro } from "./DirectionalGyro/DirectionalGyro";
import { CompassConfigProps } from "./DirectionalGyro/CompassConfigProps";

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

const App = () => {
  const heading = 60;
  return <DirectionalGyro heading={heading} {...COMPASS_PROPS} />;
};

export default App;
