export function Switch({ className = "", defaultChecked = false, checked, ...props }) {
  const isChecked = checked ?? defaultChecked;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isChecked
          ? "bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_6px_18px_rgba(155,143,246,0.28)]"
          : "bg-[#dbd7d3]"
      } ${className}`.trim()}
      {...props}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          isChecked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
