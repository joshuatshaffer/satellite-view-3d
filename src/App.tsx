import { CameraPassthrough } from "./CameraPassthrough";
import { Compass } from "./Compass";
import { Orientation } from "./Orientation";

export function App() {
  return (
    <>
      <CameraPassthrough />
      <Compass />
      <Orientation />
    </>
  );
}
