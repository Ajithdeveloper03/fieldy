import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { subscribeLiveSync } from "../utils/liveSyncBus";

/**
 * Automatically runs `fetcher` on screen focus, on app foreground resume,
 * whenever any screen emits a `liveSyncBus` mutation event, and every 10s
 * while focused so Web Admin -> Mobile communication stays live in real time.
 */
export function useLiveRefresh(
  fetcher: () => void | Promise<void>,
  intervalMs = 10000
) {
  const effectiveInterval = Math.min(Math.max(intervalMs, 3000), 10000);
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
      const timer = setInterval(run, effectiveInterval);
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
    }, [effectiveInterval])
  );
}
