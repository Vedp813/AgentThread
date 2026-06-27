import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
};

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-10 w-10 rounded-full object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-cyan-300 text-xs font-bold text-zinc-800",
        className
      )}
    >
      {fallback.slice(0, 2).toUpperCase()}
    </div>
  );
}
