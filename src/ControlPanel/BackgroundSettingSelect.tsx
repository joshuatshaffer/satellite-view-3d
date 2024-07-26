import { useAtom } from "jotai";
import { backgroundSettingAtom } from "../settings";

export function BackgroundSettingSelect() {
  const [background, setBackground] = useAtom(backgroundSettingAtom);

  return (
    <div>
      <label>Background </label>
      <select
        value={background}
        onChange={(event) => {
          const newValue = event.target.value;

          if (newValue !== "cameraPassthrough" && newValue !== "none") {
            throw new Error("Invalid background setting");
          }

          setBackground(newValue);
        }}
      >
        <option value="none">None</option>
        <option value="cameraPassthrough">Camera Passthrough</option>
      </select>
    </div>
  );
}
