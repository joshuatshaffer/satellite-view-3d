import { useAtom } from "jotai";
import {
  dragScaleAtom,
  viewControlSettingAtom,
  viewControlSettingValues,
} from "../settings";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";

export function ViewControlSettingSelect() {
  const [viewControlSetting, setViewControlSetting] = useAtom(
    viewControlSettingAtom
  );
  const [dragScale, setDragScale] = useAtom(dragScaleAtom);

  return (
    <>
      <SelectField
        label="View Control"
        options={viewControlSettingValues}
        getOptionLabel={(option) =>
          ({
            drag: "Drag",
            look: "Look",
            deviceOrientation: "Device Orientation",
          }[option])
        }
        value={viewControlSetting}
        onChange={setViewControlSetting}
      />

      {viewControlSetting === "drag" ? (
        <NumberField
          label="Drag Scale"
          value={dragScale}
          onChange={setDragScale}
        />
      ) : null}
    </>
  );
}
