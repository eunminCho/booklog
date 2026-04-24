import type { BootstrapPayload } from "./schema";

export function buildBootstrapScript(payload: BootstrapPayload): string {
  const json = JSON.stringify(payload)
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--")
    .replace(/-->/g, "--\\>");

  return `window.__BOOKLOG_BOOTSTRAP__ = ${json};`;
}
