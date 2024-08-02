import { useAtom } from "jotai";
import { degToDms, formatAngleUnits } from "../AngleUnits";
import { coordinatesToGridCode } from "../MaidenheadLocator";
import {
  observerPositionAtom,
  observerPositionModeAtom,
  observerPositionModes,
} from "../settings";
import { NumberField } from "./NumberField";
import { SelectField } from "./SelectField";

export function ObserverPositionSettings() {
  const [mode, setMode] = useAtom(observerPositionModeAtom);
  const [{ latitude, longitude }, setPosition] = useAtom(observerPositionAtom);

  return (
    <fieldset>
      <legend>Observer Position</legend>
      <SelectField
        label="Mode"
        options={observerPositionModes}
        getOptionLabel={(option) =>
          ({
            currentPosition: "Current position",
            manual: "Manual",
          }[option])
        }
        value={mode}
        onChange={setMode}
      />
      <NumberField
        label="Lat"
        min={-90}
        max={90}
        value={latitude}
        onChange={(latitude) => {
          setPosition((prev) => ({
            ...prev,
            latitude,
          }));
        }}
      />
      <NumberField
        label="Lon"
        min={-180}
        max={180}
        value={longitude}
        onChange={(longitude) => {
          setPosition((prev) => ({
            ...prev,
            longitude,
          }));
        }}
      />
      <div>{formatAngleUnits(degToDms(latitude))}</div>
      <div>{formatAngleUnits(degToDms(longitude))}</div>
      <div>{coordinatesToGridCode({ latitude, longitude })}</div>
    </fieldset>
  );
}
