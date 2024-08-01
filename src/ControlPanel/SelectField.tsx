import { ReactNode, useId } from "react";
import { isElementOf } from "../isElementOf";
import styles from "./Field.module.css";

interface SelectFieldProps<T extends string> {
  label: ReactNode;
  options: readonly T[];
  getOptionLabel: (option: T) => ReactNode;
  value: T;
  onChange: (value: T) => void;
}

export function SelectField<const T extends string>({
  label,
  options,
  getOptionLabel,
  value,
  onChange,
}: SelectFieldProps<T>) {
  const id = useId();

  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}{" "}
      </label>
      <select
        id={id}
        className={styles.fieldInput}
        value={value}
        onChange={(event) => {
          const newValue = event.target.value;

          if (!isElementOf(options, newValue)) {
            throw new Error("Invalid selection");
          }

          onChange(newValue);
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
