import "./satcat.generated.js";
import { byNoradCatId } from "./Satellite";

const iss = byNoradCatId.get(25544);
if (!iss) {
  throw new Error("ISS not found in satellite database.");
}

export function App() {
  return <>{JSON.stringify(iss)}</>;
}
