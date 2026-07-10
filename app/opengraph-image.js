import { ImageResponse } from "next/og";

export const alt =
  "HealthyMuch — Kalkulator BMI & kebutuhan nutrisi harian";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * Generated Open Graph card shown when the site is shared on social media.
 *
 * @returns {Promise<ImageResponse>}
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 55%, #0ea5e9 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.5px",
          }}
        >
          HealthyMuch
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            maxWidth: 900,
          }}
        >
          Kalkulator BMI & kebutuhan nutrisi harian
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: "#bae6fd",
            maxWidth: 880,
            lineHeight: 1.4,
          }}
        >
          Hitung BMI, berat ideal, kalori, protein, lemak, dan karbohidrat —
          gratis, langsung tanpa login.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
