import Link from "next/link";
import { GraduationCapIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site";

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      aria-label={`${siteConfig.name} - accueil`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs ring-1 ring-slate-900/10 transition-transform duration-200 group-hover:-translate-y-0.5">
        <GraduationCapIcon className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          {siteConfig.name}
        </span>
        {!compact && (
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
            {siteConfig.productName}
          </span>
        )}
      </span>
    </Link>
  );
}
