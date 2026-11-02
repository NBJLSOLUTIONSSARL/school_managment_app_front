import type { ReactNode } from "react";

type AlertProps = {
  tone?: "error" | "info" | "success";
  title?: string;
  children: ReactNode;
};

const tones = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div
      className={["rounded border p-4 text-sm leading-6", tones[tone]].join(" ")}
      role={tone === "error" ? "alert" : "status"}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
