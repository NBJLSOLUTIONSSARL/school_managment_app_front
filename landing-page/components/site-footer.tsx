import Link from "next/link";
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { contactDetails, siteConfig } from "@/lib/site";

const contactIcons = {
  address: MapPinIcon,
  phone: PhoneIcon,
  email: MailIcon,
  hours: ClockIcon,
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Ce site presente les informations de l&apos;etablissement et permet
              aux familles de deposer une candidature en ligne. Les donnees sont
              transmises directement a l&apos;administration.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-slate-900">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/#etablissement"
                  className="text-slate-600 hover:text-slate-900"
                >
                  L&apos;etablissement
                </Link>
              </li>
              <li>
                <Link
                  href="/admissions"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Candidature en ligne
                </Link>
              </li>
              <li>
                <Link
                  href="/suivi"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Suivi de candidature
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Contact
            </h2>
            {contactDetails.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {contactDetails.map((item) => {
                  const Icon = contactIcons[item.key as keyof typeof contactIcons];
                  return (
                    <li key={item.key} className="flex gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>
                        <span className="sr-only">{item.label} : </span>
                        {item.key === "email" ? (
                          <a
                            href={`mailto:${item.value}`}
                            className="hover:text-slate-900"
                          >
                            {item.value}
                          </a>
                        ) : item.key === "phone" ? (
                          <a
                            href={`tel:${item.value.replace(/\s/g, "")}`}
                            className="hover:text-slate-900"
                          >
                            {item.value}
                          </a>
                        ) : (
                          item.value
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Les coordonnees officielles seront publiees ici des qu&apos;elles
                seront disponibles.
              </p>
            )}
            <Link
              href="/contact"
              className="mt-4 inline-flex text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
            >
              Page contact
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. Tous droits reserves.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Plateforme {siteConfig.productName}</span>
            <a
              href={siteConfig.backofficeUrl}
              className="hover:text-slate-900"
              rel="noreferrer"
            >
              Espace administration
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
