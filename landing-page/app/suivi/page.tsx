import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  ClockIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { applicationStatusLabels } from "@/lib/admission";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Suivi de candidature",
  description:
    "Informations sur le suivi d'une candidature et les statuts du dossier d'admission.",
  alternates: {
    canonical: "/suivi",
  },
  openGraph: {
    title: `Suivi de candidature | ${siteConfig.name}`,
    description:
      "Informations sur le suivi d'une candidature et les statuts du dossier d'admission.",
    url: `${siteConfig.url}/suivi`,
  },
};

const statuses = [
  {
    key: "SUBMITTED",
    description:
      "La candidature a été enregistrée par le service d'admission.",
    icon: FileTextIcon,
  },
  {
    key: "UNDER_REVIEW",
    description:
      "Le dossier est en cours d'examen par l'administration de l'établissement.",
    icon: ClockIcon,
  },
  {
    key: "ACCEPTED",
    description:
      "L'admission a été acceptée. L'administration poursuit la procédure avec la famille.",
    icon: CheckCircleIcon,
  },
  {
    key: "WAITLISTED",
    description:
      "La candidature est placée en liste d'attente par l'administration.",
    icon: ClipboardCheckIcon,
  },
  {
    key: "REJECTED",
    description:
      "La candidature n'a pas été retenue. Contactez l'administration pour connaître les motifs.",
    icon: ShieldCheckIcon,
  },
];

export default function SuiviPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <nav aria-label="Fil d'Ariane" className="text-xs text-slate-500">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-slate-800">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-slate-700">Suivi</li>
            </ol>
          </nav>

          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Suivi de candidature
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Où en est ma candidature ?
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Cette page présente les statuts utilisés par le service
              d&apos;admission. La consultation en ligne d&apos;un dossier
              individuel n&apos;est pas encore disponible.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70">
        <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <Alert tone="info" title="Le suivi en ligne n'est pas disponible actuellement">
                L&apos;API de l&apos;application ne propose pas encore de
                consultation publique du statut d&apos;une candidature. Pour
                connaître l&apos;avancement de votre dossier, contactez
                l&apos;administration en indiquant votre numéro de candidature.
              </Alert>

              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Où trouver mon numéro de candidature ?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Le numéro est affiché à la fin du formulaire de candidature,
                  après l&apos;enregistrement du dossier par le service
                  d&apos;admission. Il se présente sous la forme
                  <span className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800">
                    #identifiant
                  </span>
                  et doit être conservé.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Si vous ne l&apos;avez pas noté, contactez l&apos;administration
                  en précisant le nom complet de l&apos;élève et sa date de
                  naissance.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Contacter l&apos;administration
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/admissions"
                    className="inline-flex h-10 items-center justify-center rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    Déposer une candidature
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h2 className="text-sm font-semibold text-slate-900">
                Les statuts d&apos;une candidature
              </h2>
              <ol className="mt-4 space-y-3">
                {statuses.map((status) => {
                  const Icon = status.icon;
                  return (
                    <li
                      key={status.key}
                      className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-600 shadow-2xs ring-1 ring-slate-200">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {applicationStatusLabels[status.key]}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-600">
                          {status.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                Les statuts sont mis à jour par l&apos;administration de
                l&apos;établissement. Aucun statut ne peut être modifié depuis
                ce site public.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
