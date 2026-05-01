export function Avatar({ className = "", ...props }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 ${className}`.trim()}
      {...props}
    />
  );
}

export function AvatarFallback({ className = "", ...props }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center text-sm font-semibold text-slate-700 ${className}`.trim()}
      {...props}
    />
  );
}
