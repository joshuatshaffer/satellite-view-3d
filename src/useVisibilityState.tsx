import { useSyncExternalStore } from "react";

function subscribeToVisibilityState(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getVisibilityState() {
  return document.visibilityState;
}

export function useVisibilityState() {
  return useSyncExternalStore(subscribeToVisibilityState, getVisibilityState);
}
