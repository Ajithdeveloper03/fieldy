type SyncTopic = "all" | "attendance" | "tasks" | "visits" | "sites" | "profile" | "notifications";
type Listener = (topic: SyncTopic) => void;

const listeners = new Set<Listener>();

export function emitLiveSync(topic: SyncTopic = "all") {
  listeners.forEach((cb) => {
    try {
      cb(topic);
    } catch {
      // Ignore individual subscriber errors
    }
  });
}

export function subscribeLiveSync(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
