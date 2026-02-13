import { monitorEventLoopDelay } from "perf_hooks";

export const loopMonitor = monitorEventLoopDelay({
  resolution: 20,
});

loopMonitor.enable();
