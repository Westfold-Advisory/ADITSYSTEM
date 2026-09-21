import { useCallback, useLayoutEffect, useRef } from "react";

import type { UnauthorizedReason } from "@/api/http";

/**
 * Callback estable para ApiClient.onUnauthorized; el handler real puede usar
 * setState declarado después del cliente HTTP.
 */
export function useStableUnauthorizedHandler(
  handler: (reason: UnauthorizedReason) => void,
): (reason: UnauthorizedReason) => void {
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback((reason: UnauthorizedReason) => {
    handlerRef.current(reason);
  }, []);
}
