import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} - site officiel`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#0f172a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {siteConfig.shortName}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
              {siteConfig.name}
            </div>
            <div style={{ fontSize: 16, color: "#64748b", letterSpacing: 2 }}>
              SITE OFFICIEL
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 56,
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#0f172a",
              maxWidth: 900,
            }}
          >
            Une scolarité accompagnée, des familles informées.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 24,
              color: "#475569",
              maxWidth: 820,
            }}
          >
            Informations, contact et candidature en ligne.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e2e8f0",
            paddingTop: 28,
            fontSize: 18,
            color: "#64748b",
          }}
        >
          <span>{siteConfig.url}</span>
          <span>{siteConfig.productName}</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
