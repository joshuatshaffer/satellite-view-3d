import { useAtom } from "jotai";
import {
  dragScaleAtom,
  viewControlModeAtom,
  viewControlModes,
} from "../settings";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";

export function ViewControlSettings() {
  const [viewControlMode, setViewControlMode] = useAtom(viewControlModeAtom);
  const [dragScale, setDragScale] = useAtom(dragScaleAtom);

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
      ) : null}
    </>
  );
}
