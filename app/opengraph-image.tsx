import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Westlake History — A community archive of Westlake, Texas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide Open Graph image generated at build time. Per-page OG images
 * (e.g. story-specific) can be added later by dropping
 * opengraph-image.tsx files into individual route folders. The shared
 * style — warm paper background, ink type, oak ornament — keeps the
 * archive's identity coherent in social share previews.
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
          justifyContent: "center",
          padding: "80px 96px",
          backgroundColor: "#f8f5ee",
          color: "#1f2421",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 96,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6e6a61",
            fontFamily: "monospace",
          }}
        >
          A digital archive of the Hill Country
        </div>
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 96,
            fontSize: 16,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6e6a61",
            fontFamily: "monospace",
          }}
        >
          Vol. 1 · Spring 2026
        </div>

        <div
          style={{
            fontSize: 132,
            fontStyle: "italic",
            lineHeight: 1,
            letterSpacing: -3,
            display: "flex",
          }}
        >
          Westlake History
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 32,
            fontStyle: "italic",
            color: "#3d3225",
            lineHeight: 1.3,
            maxWidth: 900,
            display: "flex",
          }}
        >
          A community archive of the people, places, schools, churches, and
          institutions of Westlake, Texas.
        </div>

        {/* Ornament line */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#9c4a2a",
          }}
        >
          <div style={{ width: 80, height: 1, backgroundColor: "#3d3225" }} />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#9c4a2a",
            }}
          />
          <div style={{ width: 80, height: 1, backgroundColor: "#3d3225" }} />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 96,
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#6e6a61",
            fontFamily: "monospace",
          }}
        >
          westlakehistory.com
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 96,
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#6e6a61",
            fontFamily: "monospace",
          }}
        >
          30°18′N · 97°48′W
        </div>
      </div>
    ),
    { ...size },
  );
}
