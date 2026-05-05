import { ImageResponse } from "next/og";
import { loadOne } from "@/lib/content";
import type { Story } from "@/lib/schemas";

export const runtime = "nodejs";
export const alt = "Story from Westlake History";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-story Open Graph image. Renders the title, era/tags, and a small
 * Westlake History wordmark in the corner — share previews carry the
 * story's name and identity, not just the site-wide one.
 */
export default async function StoryOg({
  params,
}: {
  params: { slug: string };
}) {
  const story = await loadOne("stories", params.slug);
  if (!story) {
    return defaultFallback();
  }
  const f = story.frontmatter as Story;

  const tags = [...(f.era ?? []), ...(f.tags ?? [])].slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 88px",
          backgroundColor: "#f8f5ee",
          color: "#1f2421",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6e6a61",
            fontFamily: "monospace",
          }}
        >
          <span>Westlake History · Story</span>
          <span>westlakehistory.com</span>
        </div>

        <div
          style={{
            marginTop: 60,
            fontSize: 64,
            lineHeight: 1.05,
            letterSpacing: -1,
            display: "flex",
            maxWidth: 1024,
          }}
        >
          {f.title}
        </div>

        {f.summary ? (
          <div
            style={{
              marginTop: 28,
              fontSize: 24,
              fontStyle: "italic",
              color: "#3d3225",
              lineHeight: 1.4,
              maxWidth: 1024,
              display: "flex",
            }}
          >
            {f.summary.slice(0, 220)}
            {f.summary.length > 220 ? "…" : ""}
          </div>
        ) : null}

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#9c4a2a",
            marginBottom: 12,
          }}
        >
          <div style={{ width: 60, height: 1, backgroundColor: "#3d3225" }} />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: "#9c4a2a",
            }}
          />
          <div style={{ width: 60, height: 1, backgroundColor: "#3d3225" }} />
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 14,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#6e6a61",
            fontFamily: "monospace",
          }}
        >
          <span>{f.byline}</span>
          {f.date ? <span>·</span> : null}
          {f.date ? <span>{f.date}</span> : null}
          {tags.length ? <span>·</span> : null}
          {tags.length ? <span>{tags.join(" · ")}</span> : null}
        </div>
      </div>
    ),
    { ...size },
  );
}

function defaultFallback() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f5ee",
          color: "#1f2421",
          fontSize: 96,
          fontStyle: "italic",
          fontFamily: "serif",
        }}
      >
        Westlake History
      </div>
    ),
    { ...size },
  );
}
