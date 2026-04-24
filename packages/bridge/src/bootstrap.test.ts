import { describe, expect, it } from "vitest";
import { buildBootstrapScript } from "./bootstrap";

describe("buildBootstrapScript", () => {
  it("escapes </script> sequence in generated script", () => {
    const script = buildBootstrapScript({
      auth: { token: "token-</script>-x", userId: "u1" },
      theme: "dark",
      fontScale: 1,
      appVersion: "1.0.0",
      platform: "android",
    });

    expect(script).toContain("<\\/script>");
    expect(script).not.toContain("</script>");
  });

  it("supports JSON roundtrip via assignment payload", () => {
    const payload = {
      auth: null,
      theme: "light" as const,
      fontScale: 1.2,
      appVersion: "2.0.0",
      platform: "ios" as const,
    };

    const script = buildBootstrapScript(payload);
    const jsonSegment = script.replace("window.__BOOKLOG_BOOTSTRAP__ = ", "").replace(/;$/, "");
    const parsed = JSON.parse(jsonSegment);

    expect(parsed).toEqual(payload);
  });
});
