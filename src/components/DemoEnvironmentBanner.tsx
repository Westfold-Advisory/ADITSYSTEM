import * as React from "react";

void React;

export type DemoEnvironmentBannerProps = {
  disclaimer: string;
  className?: string;
};

export function DemoEnvironmentBanner({
  disclaimer,
  className = "deployment-demo-banner",
}: DemoEnvironmentBannerProps) {
  return (
    <div className={className} role="note">
      {disclaimer}
    </div>
  );
}
