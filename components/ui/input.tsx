import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200",
        className
      )}
      {...props}
    />
  );
}
