export function Badge({ className = "", variant = "default", ...props }) {
  const variantClass =
    variant === "secondary"
      ? "bg-slate-100 text-slate-700 border border-slate-200"
      : "bg-slate-900 text-white border border-slate-900";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClass} ${className}`.trim()}
      {...props}
    />
  );
}
