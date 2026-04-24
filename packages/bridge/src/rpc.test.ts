import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRpcClient } from "./rpc";
import type { Logger } from "./logger";

type SendMsg = { id?: string; type: "PING"; payload?: { ts: number } };
type RecvMsg = { id?: string; ok: boolean };

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("createRpcClient", () => {
  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("rpc-id");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("resolves request when matching response arrives", async () => {
    let incomingHandler: ((msg: RecvMsg) => void) | undefined;
    const send = vi.fn((msg: SendMsg) => {
      incomingHandler?.({ id: msg.id, ok: true });
    });
    const onIncoming = vi.fn((handler: (msg: RecvMsg) => void) => {
      incomingHandler = handler;
      return () => {};
    });

    const rpc = createRpcClient<SendMsg, RecvMsg>({ send, onIncoming });
    const result = await rpc.request("PING", { ts: 1 });

    expect(result).toEqual({ id: "rpc-id", ok: true });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rejects on timeout and clears pending request state", async () => {
    vi.useFakeTimers();

    let incomingHandler: ((msg: RecvMsg) => void) | undefined;
    const send = vi.fn();
    const logger = createMockLogger();
    const onIncoming = vi.fn((handler: (msg: RecvMsg) => void) => {
      incomingHandler = handler;
      return () => {};
    });

    const rpc = createRpcClient<SendMsg, RecvMsg>({
      send,
      onIncoming,
      timeoutMs: 100,
      logger,
    });

    const pending = rpc.request("PING", { ts: 1 });
    const rejectionAssertion = expect(pending).rejects.toThrow("RPC timeout after 100ms for id rpc-id");
    await vi.advanceTimersByTimeAsync(101);
    await rejectionAssertion;

    incomingHandler?.({ id: "rpc-id", ok: true });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("resolves first response and ignores duplicate with warn", async () => {
    let incomingHandler: ((msg: RecvMsg) => void) | undefined;
    const send = vi.fn((msg: SendMsg) => {
      incomingHandler?.({ id: msg.id, ok: true });
      incomingHandler?.({ id: msg.id, ok: true });
    });
    const logger = createMockLogger();
    const onIncoming = vi.fn((handler: (msg: RecvMsg) => void) => {
      incomingHandler = handler;
      return () => {};
    });

    const rpc = createRpcClient<SendMsg, RecvMsg>({ send, onIncoming, logger });
    const result = await rpc.request("PING", { ts: 1 });

    expect(result).toEqual({ id: "rpc-id", ok: true });
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("rejects if send throws and removes pending request", async () => {
    const send = vi.fn(() => {
      throw new Error("send failed");
    });
    const onIncoming = vi.fn(() => () => {});
    const rpc = createRpcClient<SendMsg, RecvMsg>({ send, onIncoming });

    await expect(rpc.request("PING", { ts: 1 })).rejects.toThrow("send failed");
  });

  it("dispose unsubscribes and rejects pending requests", async () => {
    vi.useFakeTimers();

    let incomingHandler: ((msg: RecvMsg) => void) | undefined;
    const unsubscribe = vi.fn();
    const logger = createMockLogger();
    const send = vi.fn();
    const onIncoming = vi.fn((handler: (msg: RecvMsg) => void) => {
      incomingHandler = handler;
      return unsubscribe;
    });

    const rpc = createRpcClient<SendMsg, RecvMsg>({ send, onIncoming, logger });
    const pending = rpc.request("PING", { ts: 1 });
    const rejectionAssertion = expect(pending).rejects.toThrow("RPC client disposed");

    incomingHandler?.({ ok: true });
    expect(logger.warn).not.toHaveBeenCalled();

    rpc.dispose();
    await rejectionAssertion;
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
