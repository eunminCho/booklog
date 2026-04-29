"use client";

import { BRIDGE_VERSION, createConsoleLogger, postToNative } from "@booklog/bridge";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const logger = createConsoleLogger("route-loading-reporter");
const ROUTE_LOADING_MESSAGE = "WEB_ROUTE_LOADING";

function postRouteLoading(loading: boolean): void {
  postToNative(
    {
      v: BRIDGE_VERSION,
      type: "LOG",
      payload: {
        level: "info",
        message: ROUTE_LOADING_MESSAGE,
        context: { loading },
      },
    },
    logger,
  );
}

export function NativeRouteLoadingReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const link = target?.closest("a[href]");
      if (!link) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      if (link.getAttribute("target") === "_blank") {
        return;
      }

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      if (`${url.pathname}${url.search}` === `${window.location.pathname}${window.location.search}`) {
        return;
      }

      postRouteLoading(true);
    };

    window.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    postRouteLoading(false);
  }, [pathname, searchParams]);

  return null;
}
