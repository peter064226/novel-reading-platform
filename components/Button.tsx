import type { ButtonProps } from "@/types";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 " +
    "disabled:bg-violet-300 disabled:cursor-not-allowed",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 " +
    "border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        // Base styles — minimum 44×44 px touch target
        "inline-flex items-center justify-center",
        "min-h-[44px] min-w-[44px] px-6 py-2.5",
        "rounded-lg text-base font-medium",
        "transition-colors duration-150 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
