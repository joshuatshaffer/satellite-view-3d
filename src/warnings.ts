import { useSyncExternalStore } from "react";

const warnings = new Map<unknown, string>();
const warningListeners = new Set<() => void>();
let warningsSnapshot = Array.from(warnings.values());

function onWarningsChange() {
  console.log("Warnings changed", warnings);
  warningsSnapshot = Array.from(warnings.values());
  for (const listener of warningListeners) {
    listener();
  }
}

export function addWarning(warning: string) {
  const warningId = {};
  warnings.set(warningId, warning);
  onWarningsChange();

  return () => {
    warnings.delete(warningId);
    onWarningsChange();
  };
}

function subscribe(listener: () => void) {
  warningListeners.add(listener);

  return () => {
    warningListeners.delete(listener);
  };
}

export function useWarnings() {
  return useSyncExternalStore(subscribe, () => warningsSnapshot);
}
