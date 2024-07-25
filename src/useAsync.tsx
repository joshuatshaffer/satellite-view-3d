import { useEffect, useState } from "react";

export interface PromisePendingStatus {
  status: "pending";
}

export type PromiseStatus<T> = PromisePendingStatus | PromiseSettledResult<T>;

export function useAsync<T>(
  fn: (args: { signal: AbortSignal }) => PromiseLike<T>
) {
  const [status, setStatus] = useState<PromiseStatus<T>>({ status: "pending" });

  useEffect(() => {
    const abortController = new AbortController();

    try {
      fn({ signal: abortController.signal }).then(
        (value) => {
          if (abortController.signal.aborted) {
            return;
          }

          setStatus({ status: "fulfilled", value });
        },
        (reason) => {
          if (abortController.signal.aborted) {
            return;
          }

          setStatus({ status: "rejected", reason });
        }
      );
    } catch (error) {
      setStatus({ status: "rejected", reason: error });
    }

    return () => {
      abortController.abort();
      setStatus({ status: "pending" });
    };
  }, [fn]);

  return status;
}
