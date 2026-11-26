import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { subscribeLiveSync } from "../utils/liveSyncBus";

/**
 * Automatically runs `fetcher` on screen focus, on app foreground resume,
 * whenever any screen emits a `liveSyncBus` mutation event, and on a lightweight
 * background interval (default 12s) while focused so all screens stay 100% in sync.
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
      const unsubSync = subscribeLiveSync(() => run());
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          run();
        }
      });

      return () => {
        active = false;
        clearInterval(timer);
        unsubSync();
        sub.remove();
      };
    }, [intervalMs])
  );
}
