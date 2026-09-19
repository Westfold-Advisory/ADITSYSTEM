import * as React from "react";

import { cn } from "@/lib/utils";

void React;

function SkeletonBlock({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("ui-skeleton", className)} />;
}

export function EventCardSkeleton() {
  return (
    <article className="ui-skeleton-card" aria-hidden="true">
      <SkeletonBlock className="ui-skeleton-label" />
      <SkeletonBlock className="ui-skeleton-title" />
      <SkeletonBlock className="ui-skeleton-line" />
      <SkeletonBlock className="ui-skeleton-line ui-skeleton-line--short" />
      <SkeletonBlock className="ui-skeleton-meta" />
      <SkeletonBlock className="ui-skeleton-button" />
    </article>
  );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="event-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ResultsPanelSkeleton() {
  return (
    <div className="ui-skeleton-results" aria-hidden="true">
      <SkeletonBlock className="ui-skeleton-line ui-skeleton-line--short" />
      <SkeletonBlock className="ui-skeleton-row" />
      <SkeletonBlock className="ui-skeleton-row" />
      <SkeletonBlock className="ui-skeleton-row" />
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <article className="event-detail ui-skeleton-detail" aria-hidden="true">
      <SkeletonBlock className="ui-skeleton-link" />
      <SkeletonBlock className="ui-skeleton-label" />
      <SkeletonBlock className="ui-skeleton-title" />
      <SkeletonBlock className="ui-skeleton-line" />
      <SkeletonBlock className="ui-skeleton-line" />
      <SkeletonBlock className="ui-skeleton-meta" />
    </article>
  );
}

export function EventFormSkeleton() {
  return (
    <div className="ui-skeleton-form" aria-hidden="true">
      <SkeletonBlock className="ui-skeleton-title" />
      {Array.from({ length: 6 }, (_, index) => (
        <SkeletonBlock key={index} className="ui-skeleton-control" />
      ))}
      <SkeletonBlock className="ui-skeleton-button" />
    </div>
  );
}

export function MapControlsSkeleton() {
  return (
    <div className="ui-skeleton-map-controls" aria-hidden="true">
      <SkeletonBlock className="ui-skeleton-control" />
      <SkeletonBlock className="ui-skeleton-row" />
      <SkeletonBlock className="ui-skeleton-row" />
    </div>
  );
}
