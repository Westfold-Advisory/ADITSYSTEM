import { useEffect, type RefObject } from "react";
import { getFocusTrapBoundary, shouldWrapTabFocus } from "@/lib/focus-trap";

/** Focus trap, Escape to close, initial focus, and return focus on unmount. */
export function useModalFocus({
  containerRef,
  returnFocusRef,
  onClose,
  initialFocusRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    initialFocusRef?.current?.focus();
  }, [initialFocusRef]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof Node && node.contains(target)) return;
      const boundary = getFocusTrapBoundary(node);
      boundary?.first.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      const boundary = getFocusTrapBoundary(node);
      const wrap = shouldWrapTabFocus(event, document.activeElement, boundary);
      if (wrap === "first") {
        event.preventDefault();
        boundary?.first.focus();
      } else if (wrap === "last") {
        event.preventDefault();
        boundary?.last.focus();
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    node.addEventListener("keydown", handleKeyDown);
    const returnTarget = returnFocusRef?.current;
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      node.removeEventListener("keydown", handleKeyDown);
      returnTarget?.focus();
    };
  }, [containerRef, onClose, returnFocusRef]);
}
