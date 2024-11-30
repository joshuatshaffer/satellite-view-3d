import { ComponentPropsWithoutRef, ReactNode, useId } from "react";
import styles from "./Field.module.css";

type ForwardedToInput = Omit<
  ComponentPropsWithoutRef<"input">,
  "id" | "className" | "type" | "value" | "onChange"
>;

interface NumberFieldProps extends ForwardedToInput {
  label: ReactNode;
  value: number;
  onChange: (newValue: number) => void;
}

export function NumberField({
  label,
  value,
  onChange,
  ...forwardedToInput
}: NumberFieldProps) {
  const id = useId();

  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}{" "}
      </label>
      <input
        {...forwardedToInput}
        id={id}
        className={styles.fieldInput}
        type="number"
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
