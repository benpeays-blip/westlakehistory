import Link from "next/link";
import { notFound } from "next/navigation";
import { loadOne, loadType, resolveRefs } from "@/lib/content";
import { SourcesConnectionsSidebar } from "@/app/components/SourcesConnectionsSidebar";
import { WanderTheArchive } from "@/app/components/WanderTheArchive";
import { AudioPlayer } from "@/app/components/AudioPlayer";
import { renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const items = await loadType("audio");
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("audio", slug);
  if (!item) return {};
  const f = item.frontmatter as { title?: string; summary?: string };
  return {
    title: `${f.title ?? slug} — Westlake History`,
    description: f.summary,
  };
}

export default async function AudioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadOne("audio", slug);
  if (!item) notFound();

  const f = item.frontmatter as {
    title: string;
    audioType?: string;
    interviewee?: string;
    interviewer?: string;
    date?: string;
    duration?: string;
    audioFile: string;
    summary?: string;
    rssGuid?: string;
    people?: string[];
    places?: string[];
    stories?: string[];
    documents?: string[];
    collections?: string[];
  };

  const [people, places, stories, documents, collections] = await Promise.all([
    resolveRefs("people", f.people),
    resolveRefs("places", f.places),
    resolveRefs("stories", f.stories),
    resolveRefs("documents", f.documents),
    resolveRefs("collections", f.collections),
  ]);

  const groups = [
    { label: "People", items: people },
    { label: "Places", items: places },
    { label: "Stories", items: stories },
    { label: "Documents", items: documents },
    { label: "Collections", items: collections },
  ];

  return (
    <article className="mx-auto max-w-[1320px] px-6 py-10 md:px-10 md:py-14">
      <Link
        href="/audio"
        className="meta-line border-b border-transparent pb-px text-ink-mute transition-colors hover:border-oak hover:text-oak"
      >
        ← Back to audio
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <header className="border-b border-rule pb-8">
            <p className="label-archival">{f.audioType ?? "Audio"}</p>
            <h1 className="mt-3 font-display text-[32px] leading-[1.1] tracking-[-0.005em] text-ink md:text-[44px]">
              {f.title}
            </h1>
            <p className="meta-line mt-3 text-ink-mute">
              {[
                f.interviewee ? `Interviewee: ${f.interviewee}` : null,
                f.interviewer ? `Interviewer: ${f.interviewer}` : null,
                f.date,
                f.duration,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {f.summary ? (
              <p className="mt-5 max-w-[640px] text-[18px] leading-[1.55] text-ink">
                {f.summary}
              </p>
            ) : null}
          </header>

          <div className="mt-8">
            <AudioPlayer
              src={f.audioFile}
              title={f.title}
              subtitle={[f.audioType, f.date, f.duration].filter(Boolean).join(" · ")}
            />
          </div>

          <div className="mt-12">
            <h2 className="font-display text-[22px] leading-tight text-ink">
              Transcript
            </h2>
            <p className="mt-2 max-w-[680px] text-[14.5px] leading-snug text-ink-mute">
              A timecoded transcript will appear here once the archive&apos;s
              transcription pipeline is in place. Recordings will be
              transcribed via Whisper and the result reviewed by a curator
              before publication.
            </p>
            <div className="mt-6 border border-dashed border-rule p-6 text-[14px] leading-snug text-ink-mute">
              Transcript pending — recording added to the queue.
            </div>
          </div>

          {item.body.trim() ? (
            <div className="mt-12 border-t border-rule pt-8">
              <h2 className="font-display text-[22px] leading-tight text-ink">
                Notes
              </h2>
              <div className="mt-4">
                {renderMarkdown(item.body, {
                  components: {
                    p: ({ children }) => (
                      <p className="mb-5 text-[16px] leading-[1.7] text-ink">
                        {children}
                      </p>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
                      >
                        {children}
                      </a>
                    ),
                  },
                })}
              </div>
            </div>
          ) : null}

          {f.rssGuid ? (
            <p className="meta-line mt-8 text-ink-mute">
              Source: <em className="not-italic">Our Westlake</em> podcast ·
              GUID {f.rssGuid}
            </p>
          ) : null}
        </div>

        <SourcesConnectionsSidebar groups={groups} />
      </div>

      <WanderTheArchive fromType="audio" fromSlug={slug} />
    </article>
  );
}
