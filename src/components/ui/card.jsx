export function Card({ className = "", ...props }) {
  return (
    <div
      className={`border border-white/70 bg-white/75 shadow-[0_18px_45px_rgba(155,143,246,0.12)] backdrop-blur-md ${className}`.trim()}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-6 pb-0 ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-lg font-semibold ${className}`.trim()} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 ${className}`.trim()} {...props} />;
}
