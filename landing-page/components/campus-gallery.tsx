import Image from "next/image";

const photos = [
  {
    src: "/images/classroom.jpg",
    alt: "Des eleves suivant un cours dans une salle de classe de l'etablissement",
    title: "Salles de classe",
    subtitle: "Un cadre propice a la concentration",
    featured: true,
  },
  {
    src: "/images/teacher.jpg",
    alt: "Un enseignant accompagnant ses eleves en classe",
    title: "Accompagnement",
    subtitle: "Des equipes pedagogiques disponibles",
    featured: false,
  },
  {
    src: "/images/school-life.jpg",
    alt: "Des eleves dans les espaces de vie de l'etablissement",
    title: "Vie scolaire",
    subtitle: "Des espaces pour apprendre et grandir",
    featured: false,
  },
  {
    src: "/images/students-seated.jpg",
    alt: "Des eleves attentifs pendant un cours",
    title: "Reussite des eleves",
    subtitle: "Un suivi attentif au quotidien",
    featured: true,
  },
] as const;

export function CampusGallery() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {photos.map((photo) => (
        <figure
          key={photo.src}
          className={[
            "group relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100",
            photo.featured ? "sm:col-span-2" : "",
          ].join(" ")}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/15 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="text-sm font-semibold text-white">{photo.title}</p>
            <p className="mt-0.5 text-[11px] text-white/75">{photo.subtitle}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
