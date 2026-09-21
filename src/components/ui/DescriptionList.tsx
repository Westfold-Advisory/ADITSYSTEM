import * as React from "react";
import type { ReactNode } from "react";

void React;

import { cn } from "@/lib/utils";

export type DescriptionListItem = {
  term: string;
  value: ReactNode;
};

/**
 * Lista término/valor institucional (densidad admin DEFAULT).
 */
export function DescriptionList({
  items,
  className,
  density = "default",
}: {
  items: DescriptionListItem[];
  className?: string;
  density?: "default" | "compact";
}) {
  return (
    <dl
      className={cn(
        "ui-description-list",
        density === "compact" && "ui-description-list--compact",
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={`${item.term}-${index}`} className="ui-description-list__row">
          <dt className="ui-description-list__term">{item.term}</dt>
          <dd className="ui-description-list__detail">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
