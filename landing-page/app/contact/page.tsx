import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { ButtonLink } from "@/components/ui/button-link";
import { contactDetails, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Coordonnées et moyens de contacter l'administration de l'établissement scolaire.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description:
      "Coordonnées et moyens de contacter l'administration de l'établissement scolaire.",
    url: `${siteConfig.url}/contact`,
  },
};

const contactIcons = {
  address: MapPinIcon,
  phone: PhoneIcon,
  email: MailIcon,
  hours: ClockIcon,
};

export default function ContactPage() {
  const email = siteConfig.contact.email;
  const phone = siteConfig.contact.phone;

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
              <li className="font-medium text-slate-700">Contact</li>
            </ol>
          </nav>

          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Contact
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Contacter l&apos;administration
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Pour toute question relative à l&apos;établissement, aux niveaux
              accueillis, aux programmes ou à une candidature, adressez-vous au
              secrétariat de {siteConfig.name}.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/70">
        <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Coordonnées de l&apos;établissement
              </h2>

              {contactDetails.length > 0 ? (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {contactDetails.map((item) => {
                    const Icon =
                      contactIcons[item.key as keyof typeof contactIcons];
                    return (
                      <li
                        key={item.key}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-600 shadow-2xs ring-1 ring-slate-200">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-medium leading-6 text-slate-800">
                          {item.key === "email" ? (
                            <a
                              href={`mailto:${item.value}`}
                              className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-800"
                            >
                              {item.value}
                            </a>
                          ) : item.key === "phone" ? (
                            <a
                              href={`tel:${item.value.replace(/\s/g, "")}`}
                              className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-800"
                            >
                              {item.value}
                            </a>
                          ) : (
                            item.value
                          )}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-900">
                    Les coordonnées officielles ne sont pas encore publiées.
                  </p>
                  <p className="mt-1">
                    L&apos;administration n&apos;a pas encore configuré ses
                    coordonnées sur ce site. Veuillez vous adresser directement
                    au secrétariat de l&apos;établissement pour obtenir une
                    réponse.
                  </p>
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
                <p>
                  Ce site ne propose pas encore de formulaire de contact en
                  ligne. Les demandes doivent être adressées à
                  l&apos;administration par les moyens de contact publiés
                  ci-dessus.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h2 className="text-sm font-semibold text-slate-900">
                  Une candidature à déposer ?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Le formulaire d&apos;admission est disponible en ligne et ne
                  nécessite aucun compte.
                </p>
                <div className="mt-5">
                  <ButtonLink href="/admissions" className="w-full">
                    Candidater en ligne
                    <ArrowRightIcon className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <h2 className="text-sm font-semibold text-slate-900">
                  Vous avez déjà candidaté ?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Consultez la page de suivi pour connaître les statuts d&apos;une
                  candidature et les moyens de contacter l&apos;administration.
                </p>
                <Link
                  href="/suivi"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  Suivi de candidature
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {(email || phone) && (
                <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white shadow-2xs">
                  <h2 className="text-sm font-semibold">Contact direct</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Pour une réponse rapide, utilisez les coordonnées publiées
                    par l&apos;établissement.
                  </p>
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="mt-3 flex items-center gap-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                    >
                      <MailIcon className="h-4 w-4" />
                      {email}
                    </a>
                  )}
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="mt-2 flex items-center gap-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      {phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
