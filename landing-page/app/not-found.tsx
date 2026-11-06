import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Erreur 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          La page demandée est introuvable
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Le lien utilisé n&apos;existe pas ou a été déplacé. Vous pouvez
          revenir à l&apos;accueil ou consulter les informations de{" "}
          {siteConfig.name}.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Retour à l&apos;accueil
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            Page contact
          </Link>
        </div>
      </div>
    </section>
  );
}
