import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      {
        title: "Requete invalide",
        detail: "Le formulaire doit etre envoye en multipart/form-data.",
      },
      { status: 415 },
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json(
      {
        title: "Requete invalide",
        detail: "Le contenu du formulaire n'a pas pu etre lu.",
      },
      { status: 400 },
    );
  }

  const outgoing = new FormData();
  incoming.forEach((value, key) => {
    if (typeof value === "string") {
      outgoing.append(key, value);
    } else {
      outgoing.append(key, value, value.name);
    }
  });

  const search = new URL(request.url).searchParams;
  const target = backendUrl("/api/v1/public/applications", search);

  try {
    const response = await fetch(target, {
      method: "POST",
      body: outgoing,
      cache: "no-store",
      signal: AbortSignal.timeout(45000),
    });

    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        title: "Service indisponible",
        detail:
          "Le service d'admission est momentanement indisponible. Veuillez reessayer dans quelques instants.",
      },
      { status: 502 },
    );
  }
}
