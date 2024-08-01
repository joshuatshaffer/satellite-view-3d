import { useAtom } from "jotai";
import { degToDms, formatAngleUnits } from "../AngleUnits";
import { isElementOf } from "../isElementOf";
import {
  observerPositionAtom,
  observerPositionModeAtom,
  observerPositionModes,
} from "../settings";

export function ObserverPosition() {
  const [mode, setMode] = useAtom(observerPositionModeAtom);
  const [{ latitude, longitude }, setPosition] = useAtom(observerPositionAtom);

  return (
    <fieldset>
      <legend>Observer Position</legend>
      <div>
        <label>Mode </label>
        <select
          value={mode}
          onChange={(event) => {
            const newValue = event.target.value;

            if (!isElementOf(observerPositionModes, newValue)) {
              throw new Error("Invalid observer position mode");
            }

            setMode(newValue);
          }}
        >
          <option value="currentPosition">Current position</option>
          <option value="manual">Manual</option>
        </select>
      </div>
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
