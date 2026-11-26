import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";

/**
 * Automatically runs `fetcher` on screen focus, on app foreground resume,
 * and on a lightweight background interval (default 12s) while focused
 * so mobile screens stay live-synced with Web Admin without manual reload.
 */
export function useLiveRefresh(
  fetcher: () => void | Promise<void>,
  intervalMs = 12000
) {
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = () => {
        if (!active) return;
        try {
          void fetcherRef.current();
        } catch {
          // Ignore transient network errors during background poll
        }
      };

      run();
      const timer = setInterval(run, intervalMs);
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          run();
        }
      });

      return () => {
        active = false;
        clearInterval(timer);
        sub.remove();
      };
    }, [intervalMs])
  );
}
