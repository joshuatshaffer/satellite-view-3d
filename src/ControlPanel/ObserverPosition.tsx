import { useAtom } from "jotai";
import { degToDms, formatAngleUnits } from "../AngleUnits";
import {
  observerPositionAtom,
  observerPositionModeAtom,
  observerPositionModes,
} from "../settings";
import { SelectField } from "./SelectField";

export function ObserverPosition() {
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
      <div>
        <label>Lat </label>
        <input
          type="number"
          min={-90}
          max={90}
          value={latitude}
          onChange={(event) => {
            const newLatitude = parseFloat(event.target.value);

            if (!isNaN(newLatitude)) {
              setPosition((prev) => ({
                ...prev,
                latitude: newLatitude,
              }));
            }
          }}
        />
      </div>
      <div>
        <label>Lon </label>
        <input
          type="number"
          min={-180}
          max={180}
          value={longitude}
          onChange={(event) => {
            const newLongitude = parseFloat(event.target.value);

            if (!isNaN(newLongitude)) {
              setPosition((prev) => ({
                ...prev,
                longitude: newLongitude,
              }));
            }
          }}
        />
      </div>
      <div>{formatAngleUnits(degToDms(latitude))}</div>
      <div>{formatAngleUnits(degToDms(longitude))}</div>
    </fieldset>
  );
}
