export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type FocusTrapBoundary = {
  first: HTMLElement;
  last: HTMLElement;
};

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.hasAttribute("disabled") || element.tabIndex === -1) {
      return false;
    }
    if (typeof element.checkVisibility === "function") {
      return element.checkVisibility();
    }
    return element.getClientRects().length > 0;
  });
}

export function getFocusTrapBoundary(
  container: HTMLElement,
): FocusTrapBoundary | null {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return null;
  return { first: focusable[0], last: focusable[focusable.length - 1] };
}

/** Returns which boundary element should receive focus when Tab wraps. */
export function shouldWrapTabFocus(
  event: Pick<KeyboardEvent, "key" | "shiftKey">,
  activeElement: Element | null,
  boundary: FocusTrapBoundary | null,
): "first" | "last" | null {
  if (event.key !== "Tab" || !boundary) return null;
  if (event.shiftKey && activeElement === boundary.first) return "last";
  if (!event.shiftKey && activeElement === boundary.last) return "first";
  return null;
}
