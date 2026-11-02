const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const siteConfig = {
  name:
    process.env.NEXT_PUBLIC_INSTITUTION_NAME?.trim() ||
    "Etablissement Scolaire",
  shortName:
    process.env.NEXT_PUBLIC_INSTITUTION_SHORT_NAME?.trim() || "ES",
  tagline:
    process.env.NEXT_PUBLIC_INSTITUTION_TAGLINE?.trim() ||
    "Un espace numerique au service des familles et de l'equipe pedagogique.",
  description:
    "Site officiel de l'etablissement : informations, contact et candidature en ligne.",
  url: rawSiteUrl.replace(/\/$/, ""),
  productName: "SchoolDesk",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "",
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim() || "",
    hours: process.env.NEXT_PUBLIC_CONTACT_HOURS?.trim() || "",
  },
  backofficeUrl:
    process.env.NEXT_PUBLIC_BACKOFFICE_URL?.trim() || "http://localhost:5173",
};

export const mainNavigation = [
  { label: "Accueil", href: "/" },
  { label: "L'etablissement", href: "/#etablissement" },
  { label: "Admissions", href: "/admissions" },
  { label: "Suivi", href: "/suivi" },
  { label: "Contact", href: "/contact" },
] as const;

export const contactDetails = [
  {
    key: "address",
    label: "Adresse",
    value: siteConfig.contact.address,
  },
  {
    key: "phone",
    label: "Telephone",
    value: siteConfig.contact.phone,
  },
  {
    key: "email",
    label: "Email",
    value: siteConfig.contact.email,
  },
  {
    key: "hours",
    label: "Horaires d'accueil",
    value: siteConfig.contact.hours,
  },
].filter((item) => item.value.length > 0);

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
