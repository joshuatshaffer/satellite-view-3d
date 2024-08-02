import { useAtom } from "jotai";
import {
  dragScaleAtom,
  lookScaleAtom,
  viewControlModeAtom,
  viewControlModes,
} from "../settings";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";

export function ViewControlSettings() {
  const [viewControlMode, setViewControlMode] = useAtom(viewControlModeAtom);
  const [dragScale, setDragScale] = useAtom(dragScaleAtom);
  const [lookScale, setLookScale] = useAtom(lookScaleAtom);

  return (
    <>
      <SelectField
        label="View Mode"
        options={viewControlModes}
        getOptionLabel={(option) =>
          ({
            drag: "Drag",
            look: "Look",
            deviceOrientation: "Device Orientation",
          }[option])
        }
        value={viewControlMode}
        onChange={setViewControlMode}
      />

      {viewControlMode === "drag" ? (
        <NumberField
          label="Drag Scale"
          step={0.25}
          value={dragScale}
          onChange={setDragScale}
        />
      ) : viewControlMode === "look" ? (
        <NumberField
          label="Look Scale"
          step={0.25}
          value={lookScale}
          onChange={setLookScale}
        />
      ) : null}
    </>
  );
}
