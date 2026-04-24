import { createNoopLogger } from "./logger";
import type { Logger } from "./logger";

type PendingRequest<Recv> = {
  resolve: (value: Recv) => void;
  reject: (reason?: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function createRpcClient<
  Send extends { id?: string; type: string; payload?: unknown },
  Recv extends { id?: string },
>(options: {
  send: (msg: Send) => void;
  onIncoming: (handler: (msg: Recv) => void) => () => void;
  now?: () => number;
  timeoutMs?: number;
  logger?: Logger;
}): {
  request: (type: Send["type"], payload?: Send["payload"]) => Promise<Recv>;
  dispose: () => void;
} {
  const now = options.now ?? Date.now;
  const timeoutMs = options.timeoutMs ?? 3000;
  const logger = options.logger ?? createNoopLogger();
  const pendingById = new Map<string, PendingRequest<Recv>>();
  const settledById = new Map<string, number>();
  const settledRetentionMs = timeoutMs * 2;

  const pruneSettled = (): void => {
    const current = now();
    for (const [id, settledAt] of settledById.entries()) {
      if (current - settledAt > settledRetentionMs) {
        settledById.delete(id);
      }
    }
  };

  const handleIncoming = (msg: Recv): void => {
    const id = msg.id;
    if (!id) {
      return;
    }

    const pending = pendingById.get(id);
    if (pending) {
      clearTimeout(pending.timer);
      pendingById.delete(id);
      settledById.set(id, now());
      pending.resolve(msg);
      return;
    }

    if (settledById.has(id)) {
      logger.warn("createRpcClient ignored duplicate response for settled id", id);
    }
  };

  const unsubscribe = options.onIncoming(handleIncoming);

  const request = (type: Send["type"], payload?: Send["payload"]): Promise<Recv> => {
    pruneSettled();

    const id = crypto.randomUUID();
    const message = ({ id, type, payload } as unknown) as Send;

    return new Promise<Recv>((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingById.delete(id);
        reject(new Error(`RPC timeout after ${timeoutMs}ms for id ${id}`));
      }, timeoutMs);

      pendingById.set(id, { resolve, reject, timer });

      try {
        options.send(message);
      } catch (error) {
        const pending = pendingById.get(id);
        if (pending) {
          clearTimeout(pending.timer);
          pendingById.delete(id);
        }
        reject(error);
      }
    });
  };

  const dispose = (): void => {
    unsubscribe();
    for (const pending of pendingById.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("RPC client disposed"));
    }
    pendingById.clear();
    settledById.clear();
  };

  return { request, dispose };
}
