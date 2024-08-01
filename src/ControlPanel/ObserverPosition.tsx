import { useAtomValue } from "jotai";
import { observerPositionAtom } from "../settings";

export function ObserverPosition() {
  const observerPosition = useAtomValue(observerPositionAtom);

  return (
    <fieldset>
      <legend>Observer Position</legend>
      <div>
        <label>Lat </label>
        <input type="text" readOnly value={observerPosition.latitude} />
      </div>
      <div>
        <label>Lon </label>
        <input type="text" readOnly value={observerPosition.longitude} />
      </div>
    </fieldset>
  );
}
