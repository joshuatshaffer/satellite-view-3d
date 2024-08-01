import { ReactNode, useId } from "react";
import { isElementOf } from "../isElementOf";

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
    <div>
      <label htmlFor={id}>{label} </label>
      <select
        id={id}
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
