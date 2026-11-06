import type { Metadata } from "next";
import Link from "next/link";
import { AdmissionForm } from "@/components/admission-form";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@/components/icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Candidature en ligne",
  description:
    "Déposez en ligne votre demande d'admission pour l'établissement scolaire.",
  alternates: {
    canonical: "/admissions",
  },
  openGraph: {
    title: `Candidature en ligne | ${siteConfig.name}`,
    description:
      "Déposez en ligne votre demande d'admission pour l'établissement scolaire.",
    url: `${siteConfig.url}/admissions`,
  },
};

const checklist = [
  {
    title: "Le nom complet de l'élève",
    icon: UserIcon,
  },
  {
    title: "Sa date de naissance",
    icon: ClipboardCheckIcon,
  },
  {
    title: "Les coordonnées du parent ou tuteur, si vous souhaitez les transmettre",
    icon: FileTextIcon,
  },
];

export default function AdmissionsPage() {
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
              <li className="font-medium text-slate-700">Admissions</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Candidature en ligne
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Déposer une demande d&apos;admission
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Remplissez ce formulaire pour transmettre votre demande à
                l&apos;administration de {siteConfig.name}. La démarche est
                gratuite, sans création de compte, et vous recevrez un numéro de
                candidature après l&apos;envoi.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600 lg:max-w-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheckIcon className="h-4 w-4" />
                Formulaire officiel
              </div>
              <p className="mt-2">
                Les informations sont transmises directement au service
                d&apos;admission. Le site n&apos;enregistre aucun mot de passe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70">
        <div className="mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="min-w-0">
              <AdmissionForm />
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h2 className="text-sm font-semibold text-slate-900">
                  Avant de commencer
                </h2>
                <ul className="mt-4 space-y-3">
                  {checklist.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.title}
                        className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {item.title}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                  Les champs marqués d&apos;un astérisque sont obligatoires. Les
                  informations du parent ou tuteur sont facultatives dans le
                  formulaire, mais recommandées pour faciliter les échanges.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h2 className="text-sm font-semibold text-slate-900">
                  Après l&apos;envoi
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                  <p className="flex items-start gap-2.5">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    Un numéro de candidature s&apos;affiche à l&apos;écran.
                  </p>
                  <p className="flex items-start gap-2.5">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    Conservez ce numéro pour vos échanges avec l&apos;administration.
                  </p>
                  <p className="flex items-start gap-2.5">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    Aucune pièce jointe n&apos;est demandée dans ce formulaire.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white shadow-2xs">
                <h2 className="text-sm font-semibold">Besoin d&apos;aide ?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Pour une question sur les niveaux, l&apos;année scolaire ou la
                  suite du dossier, contactez l&apos;administration.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded bg-white px-3 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Page contact
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
