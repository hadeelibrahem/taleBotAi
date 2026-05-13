export function Input({ className = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-2xl border border-[rgba(220,210,200,0.7)] bg-[rgba(248,246,243,0.85)] px-3 py-2 text-sm text-[var(--text-dark)] placeholder:text-[var(--text-soft)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.55)] focus:outline-none focus:ring-2 focus:ring-[rgba(155,143,246,0.18)] ${className}`.trim()}
      {...props}
    />
  );
}
