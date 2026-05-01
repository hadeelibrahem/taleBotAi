const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

const variantStyles = {
  default: "border-0 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-400 text-white shadow-[0_10px_24px_rgba(155,143,246,0.28)] hover:brightness-105",
  outline: "border border-[rgba(220,210,200,0.7)] bg-white/70 text-[var(--text-mid)] shadow-[0_8px_20px_rgba(111,154,179,0.10)] hover:bg-white",
};

const sizeStyles = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  icon: "h-10 w-10",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  const classes = [
    baseStyles,
    variantStyles[variant] ?? variantStyles.default,
    sizeStyles[size] ?? sizeStyles.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
