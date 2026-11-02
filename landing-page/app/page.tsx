import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CampusGallery } from "@/components/campus-gallery";
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  GraduationCapIcon,
  ListChecksIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { contactDetails, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Informations officielles, contact et candidature en ligne de l'établissement scolaire.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} | Site officiel`,
    description:
      "Informations officielles, contact et candidature en ligne de l'établissement scolaire.",
    url: siteConfig.url,
  },
};

const objectives = [
  {
    title: "Des démarches plus simples",
    description:
      "Les familles peuvent déposer une candidature en ligne sans créer de compte ni se déplacer.",
    icon: ClipboardCheckIcon,
  },
  {
    title: "Un dossier centralisé",
    description:
      "Les informations transmises sont directement disponibles pour l'administration de l'établissement.",
    icon: FileTextIcon,
  },
  {
    title: "Une organisation lisible",
    description:
      "Le parcours de candidature est découpé en étapes claires, avec une vérification avant l'envoi.",
    icon: ListChecksIcon,
  },
];

const admissionSteps = [
  {
    title: "Renseigner l'élève",
    description:
      "Indiquez le nom complet et la date de naissance de l'enfant candidat.",
    icon: UserIcon,
  },
  {
    title: "Ajouter les coordonnées",
    description:
      "Communiquez si vous le souhaitez le nom, le téléphone et la profession du parent ou tuteur.",
    icon: UsersIcon,
  },
  {
    title: "Vérifier et envoyer",
    description:
      "Contrôlez le récapitulatif, envoyez la candidature et conservez le numéro attribué.",
    icon: CheckCircleIcon,
  },
];

const reasons = [
  {
    title: "Accessible à tous",
    description:
      "Un formulaire guidé, lisible sur ordinateur, tablette et téléphone, sans création de compte.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Transmission directe",
    description:
      "La candidature est envoyée au service d'admission de l'établissement, sans intermédiaire.",
    icon: ArrowRightIcon,
  },
  {
    title: "Informations vérifiées",
    description:
      "Un récapitulatif permet de relire les données avant l'envoi définitif du dossier.",
    icon: FileTextIcon,
  },
  {
    title: "Un numéro de référence",
    description:
      "Chaque candidature enregistrée reçoit un numéro à conserver pour vos échanges avec l'administration.",
    icon: GraduationCapIcon,
  },
];

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(siteConfig.contact.phone
      ? { telephone: siteConfig.contact.phone }
      : {}),
    ...(siteConfig.contact.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.contact.address,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-900">
        <Image
          src="/images/school-campus.jpg"
          alt="Enseignant et eleves dans l'enceinte de l'etablissement"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20" />

        <div className="relative mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Site officiel de {siteConfig.name}
            </p>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Une scolarité accompagnée, des familles informées.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Retrouvez les informations de l&apos;établissement et déposez votre
              demande d&apos;admission en ligne, simplement et en toute
              transparence. Aucun compte n&apos;est nécessaire pour candidater.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admissions"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-white px-5 text-sm font-semibold text-slate-900 shadow-2xs transition-colors hover:bg-slate-100"
              >
                Déposer une candidature
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/#etablissement"
                className="inline-flex h-11 items-center justify-center rounded border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Découvrir l&apos;établissement
              </Link>
            </div>

            <ul className="mt-9 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                Candidature sans compte
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                Formulaire guidé
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                Envoi direct à l&apos;administration
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="etablissement"
        className="scroll-mt-20 border-b border-slate-200 bg-slate-50/70"
      >
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <SectionHeading
              eyebrow="L'établissement"
              title="Une organisation au service des élèves et des familles"
              description="L'établissement s'appuie sur un espace numérique de gestion scolaire pour structurer les démarches administratives et faciliter la communication avec les familles."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {objectives.map((item, index) => {
                const Icon = item.icon;
                const featured = index === 0;
                return (
                  <div
                    key={item.title}
                    className={[
                      "rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-slate-300",
                      featured ? "sm:col-span-2 sm:flex sm:items-start sm:gap-4" : "",
                    ].join(" ")}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3
                        className={[
                          "mt-4 text-sm font-semibold text-slate-900",
                          featured ? "sm:mt-0" : "",
                        ].join(" ")}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeading
              eyebrow="Scolarité"
              title="Niveaux et programmes"
              description="Les niveaux accueillis, les programmes et les modalités d'inscription sont définis par l'établissement."
            />

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Informations à confirmer auprès de l&apos;établissement
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Le catalogue détaillé des niveaux et des programmes n&apos;est pas
                publié sur ce site. Pour connaître les niveaux ouverts, les
                programmes proposés ou les modalités d&apos;inscription, adressez
                votre demande à l&apos;administration.
              </p>

              <ul className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
                {[
                  "Niveaux accueillis",
                  "Programmes proposés",
                  "Modalités d'inscription",
                ].map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <ButtonLink href="/contact" variant="secondary">
                  Demander les informations
                  <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="admissions"
        className="scroll-mt-20 border-b border-slate-200 bg-slate-50/70"
      >
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Admissions"
              title="Candidater en ligne en trois étapes"
              description="Le formulaire reprend uniquement les informations demandées par le service d'admission de l'établissement."
            />
            <ButtonLink href="/admissions">
              Commencer ma candidature
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <figure className="relative min-h-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-2xs lg:min-h-full">
              <Image
                src="/images/admissions.jpg"
                alt="Accompagnement des familles lors de l'admission"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Candidature en ligne
                </p>
                <p className="mt-3 max-w-xs text-lg font-semibold leading-snug text-white">
                  Un dossier simple, un suivi clair à chaque étape.
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  Sans compte • 3 étapes • Envoi direct à l&apos;administration
                </p>
              </figcaption>
            </figure>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
              <ol className="relative space-y-7">
                <span
                  className="absolute bottom-3 left-5 top-3 w-px bg-slate-200"
                  aria-hidden="true"
                />
                {admissionSteps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="relative flex gap-4">
                      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-2xs">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="pb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Étape 0{index + 1}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <FileTextIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <p>
                  <span className="font-semibold text-slate-900">
                    Pièces justificatives :
                  </span>{" "}
                  aucune pièce jointe n&apos;est demandée dans le formulaire en
                  ligne. L&apos;administration vous indiquera les documents à
                  fournir pour la suite du dossier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Pourquoi candidater en ligne"
            title="Une démarche simple, transparente et accessible"
            description="Le site public a été conçu pour les familles qui souhaitent effectuer leurs démarches sans difficulté technique."
            align="center"
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-2xs ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="scroll-mt-20 border-b border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Vie scolaire"
              title="Un établissement à taille humaine"
              description="Des espaces de travail lumineux et des équipes présentes au quotidien pour accompagner chaque élève dans sa scolarité."
            />
            <ButtonLink href="/contact" variant="secondary">
              Planifier une visite
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>

          <CampusGallery />
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-900">
        <Image
          src="/images/interaction.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/55" />

        <div className="relative mx-auto grid max-w-8xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Prochaine étape
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Prêt à déposer votre demande d&apos;admission ?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Le formulaire vous guide pas à pas. Avant de commencer, préparez le
              nom complet et la date de naissance de l&apos;élève, ainsi que les
              coordonnées du parent ou du tuteur si vous souhaitez les transmettre.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/admissions"
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Candidater en ligne
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70">
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Une question sur l'établissement ou la candidature ?"
                description="Consultez la page contact pour connaître les moyens de joindre l'administration. Si les coordonnées officielles ne sont pas encore publiées, elles le seront prochainement sur ce site."
              />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contact">Page contact</ButtonLink>
                <ButtonLink href="/suivi" variant="secondary">
                  Suivi de candidature
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <MailIcon className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  Coordonnées publiées
                </h3>
              </div>
              {contactDetails.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {contactDetails.map((item) => (
                    <li key={item.key} className="flex items-center gap-2.5">
                      {item.key === "email" ? (
                        <MailIcon className="h-4 w-4 text-slate-400" />
                      ) : item.key === "phone" ? (
                        <PhoneIcon className="h-4 w-4 text-slate-400" />
                      ) : (
                        <BuildingIcon className="h-4 w-4 text-slate-400" />
                      )}
                      <span>
                        <span className="font-medium text-slate-800">
                          {item.label} :
                        </span>{" "}
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Les coordonnées officielles de l&apos;établissement ne sont pas
                  encore configurées sur ce site. Elles seront publiées ici dès
                  qu&apos;elles seront disponibles.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
