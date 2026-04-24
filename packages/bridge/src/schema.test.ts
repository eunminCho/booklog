import { describe, expect, it } from "vitest";
import { BRIDGE_VERSION, NativeToWebMessageSchema, WebToNativeMessageSchema } from "./schema";

describe("NativeToWebMessageSchema", () => {
  const validCases: unknown[] = [
    { v: BRIDGE_VERSION, type: "SET_AUTH", payload: { token: "t", userId: "u" } },
    { v: BRIDGE_VERSION, type: "CLEAR_AUTH" },
    { v: BRIDGE_VERSION, type: "SET_THEME", payload: { theme: "dark" } },
    { v: BRIDGE_VERSION, type: "SET_FONT_SCALE", payload: { fontScale: 1.2 } },
    { v: BRIDGE_VERSION, type: "NAVIGATE", payload: { path: "/home" } },
    { v: BRIDGE_VERSION, type: "PING", payload: { ts: 1 } },
    { v: BRIDGE_VERSION, type: "PONG", payload: { ts: 2 } },
  ];

  for (const message of validCases) {
    it(`accepts valid ${String((message as { type: string }).type)}`, () => {
      expect(NativeToWebMessageSchema.safeParse(message).success).toBe(true);
    });

    it(`rejects ${String((message as { type: string }).type)} with missing required field`, () => {
      const invalid = { ...((message as Record<string, unknown>) ?? {}) };
      delete invalid.v;
      expect(NativeToWebMessageSchema.safeParse(invalid).success).toBe(false);
    });
  }
});

describe("WebToNativeMessageSchema", () => {
  const validCases: unknown[] = [
    {
      v: BRIDGE_VERSION,
      type: "READY",
      payload: {
        auth: null,
        theme: "light",
        fontScale: 1,
        appVersion: "1.0.0",
        platform: "ios",
      },
    },
    { v: BRIDGE_VERSION, type: "REQUEST_LOGOUT" },
    { v: BRIDGE_VERSION, type: "OPEN_NATIVE_SCREEN", payload: { screen: "BookDetail", params: { id: "1" } } },
    { v: BRIDGE_VERSION, type: "OPEN_EXTERNAL", payload: { url: "https://example.com" } },
    { v: BRIDGE_VERSION, type: "HAPTIC", payload: { style: "success" } },
    { v: BRIDGE_VERSION, type: "LOG", payload: { level: "info", message: "hello" } },
    { v: BRIDGE_VERSION, type: "PING", payload: { ts: 1 } },
    { v: BRIDGE_VERSION, type: "PONG", payload: { ts: 2 } },
  ];

  for (const message of validCases) {
    it(`accepts valid ${String((message as { type: string }).type)}`, () => {
      expect(WebToNativeMessageSchema.safeParse(message).success).toBe(true);
    });

    it(`rejects ${String((message as { type: string }).type)} with missing required field`, () => {
      const invalid = { ...((message as Record<string, unknown>) ?? {}) };
      delete invalid.v;
      expect(WebToNativeMessageSchema.safeParse(invalid).success).toBe(false);
    });
  }
});

describe("schema guardrails", () => {
  it("rejects unknown type", () => {
    const invalid = { v: BRIDGE_VERSION, type: "UNKNOWN_TYPE" };
    expect(NativeToWebMessageSchema.safeParse(invalid).success).toBe(false);
    expect(WebToNativeMessageSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects messages when v is not 1", () => {
    const invalidNative = { v: 2, type: "CLEAR_AUTH" };
    const invalidWeb = { v: 2, type: "REQUEST_LOGOUT" };

    expect(NativeToWebMessageSchema.safeParse(invalidNative).success).toBe(false);
    expect(WebToNativeMessageSchema.safeParse(invalidWeb).success).toBe(false);
  });
});
