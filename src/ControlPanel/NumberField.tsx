import { ReactNode, useId } from "react";
import styles from "./Field.module.css";

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: ReactNode;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
}) {
  const id = useId();

  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}{" "}
      </label>
      <input
        id={id}
        className={styles.fieldInput}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const newValue = parseFloat(event.target.value);

          if (!isNaN(newValue)) {
            onChange(newValue);
          }
        }}
      />
    </div>
  );
}
