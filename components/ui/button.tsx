import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "muted";
  size?: "default" | "sm" | "lg" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-700",
        variant === "outline" && "border border-zinc-300 bg-white hover:bg-zinc-50",
        variant === "ghost" && "hover:bg-zinc-100",
        variant === "muted" && "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 px-3",
        size === "lg" && "h-11 px-6",
        size === "icon" && "h-9 w-9",
        className
      )}
      {...props}
    />
  );
}
