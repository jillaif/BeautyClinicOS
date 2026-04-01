import type React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/70 bg-white/70 px-3 py-1 text-xs font-medium text-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
