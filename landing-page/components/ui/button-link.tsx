import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

const variants = {
  primary:
    "bg-slate-900 text-white shadow-2xs hover:bg-slate-800 focus-visible:ring-slate-900",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-900",
  ghost:
    "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-900",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={[
        "inline-flex h-11 items-center justify-center gap-2 rounded px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}
