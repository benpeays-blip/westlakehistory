# Westlake History

A community-driven digital archive for Westlake, Texas — its families, schools,
churches, sports teams, councils, and clubs. Built to host the histories of
every group that helped shape this town.

Production: **https://westlakehistory.com**

---

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 with custom paper-palette tokens
- **Type**: Fraunces, Newsreader, JetBrains Mono (Google Fonts)
- **Content**: MDX in `/content` with Zod-validated frontmatter (Phase 2)
- **Editorial UI**: Sveltia CMS (Phase 6) — git-backed, GitHub OAuth
- **Maps**: MapLibre GL JS (Phase 4) — open-source, free tiles
- **Audio**: Plyr + custom transcript-sync component (Phase 3)
- **Search**: Pagefind (Phase 5) — runs at build time, zero-cost
- **Hosting**: Vercel (auto-deploys from `main`)
- **Source**: GitHub — the repo *is* the archive

No databases. No auth servers. No vendor lock-in. If every host disappears
tomorrow, the archive is still readable as plain markdown files.

---

## Local development

Requirements: Node 20+, pnpm 9+.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm lint
```

The homepage pulls live data from the *Our Westlake* Buzzsprout RSS feed at
build time (`lib/buzzsprout.ts`), with hourly ISR revalidation. If the feed is
unreachable the page renders gracefully with empty episode/chapter sections.

---

## Project structure

```
app/
  components/      Layout shell + homepage section components
  globals.css      Design tokens (paper palette, fonts, paper grain)
  layout.tsx       Root layout (TopRule → Masthead → Nav → main → Footer)
  page.tsx         Homepage
content/           MDX archive — populated through Phase 2+
  stories/         Individual narrative pieces
  people/          Biographical entries
  places/          Locations (current and historical)
  eras/            Time periods
  documents/       Artifacts: deeds, photos, letters, news clippings
  audio/           Podcast episodes + raw interviews
  maps/            Historical maps with geo-references
  meetings/        History club meeting minutes
  collections/     Community-group collections (Eanes History Group, schools,
                   churches, sports — the umbrella scope)
lib/
  buzzsprout.ts    Build-time fetcher for the Our Westlake podcast feed
  chapters.ts     Chapter aggregator from podcast metadata
```

---

## Design tokens

CSS variables live in `app/globals.css` and are also exposed as Tailwind 4
utilities (e.g. `bg-paper`, `border-hairline-strong`, `text-rust`).

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#f3ecdb` | Page background |
| `--color-paper-deep` | `#ece3cc` | Surface variant (frames, footer) |
| `--color-ink` | `#1c1611` | Primary text |
| `--color-ink-soft` | `#3d3225` | Secondary text |
| `--color-ink-mute` | `#6b5d49` | Tertiary text / metadata |
| `--color-rust` | `#9c4a2a` | Accent / link |
| `--color-rust-deep` | `#6e3019` | Hover / pressed |
| `--color-sage` | `#6b7a5e` | Secondary accent |
| `--color-limestone` | `#c4b596` | Warm neutral |
| `--color-hairline` | `rgb(28 22 17 / 0.18)` | Subtle dividers |
| `--color-hairline-strong` | `rgb(28 22 17 / 0.45)` | Section dividers |

---

## Content authoring (Phase 2+)

Currently only the homepage is implemented. As content types come online:

- **Stories, People, Places, etc.**: write MDX files in `content/<type>/<slug>.mdx`
  with the schema-validated frontmatter (Zod schemas in `lib/schemas/`).
- **Cross-references** are slugs. Every Story links to People, Places, and an
  Era. A story without ≥1 person and ≥1 place fails validation.
- **Provenance**: every photo, document, and quote requires a `source` field.
- **Rights**: anything under copyright gets a clear `rights` field. Public
  domain by default.

Once Sveltia CMS lands (Phase 6), curators will edit through `/admin` with no
need to touch code.

---

## Phased build plan

- **Phase 1** ✅ — Foundation: scaffold, design tokens, layout, homepage with
  live podcast data
- **Phase 2** — Content schema: 8 Zod-validated content types, sample MDX,
  detail pages, indexes
- **Phase 3** — Audio + video transcription pipeline (Buzzsprout RSS +
  Eanes History Group YouTube videos), synced transcript player
- **Phase 4** — Interactive map: MapLibre + era slider + historic overlays
- **Phase 5** — Search + discovery: Pagefind, related-content algorithm
- **Phase 6** — Sveltia CMS, contribution form, print stylesheet

---

## Operating principles

- **Provenance always.** No anonymous content.
- **Public domain by default.** Copyright cleared and credited or linked, not
  reproduced.
- **Cross-references everywhere.** The site is a knowledge graph.
- **Audio has transcripts. Always.** Accessibility, search, preservation.
- **The repo is the archive.** Optimize for the markdown surviving any host.
- **No analytics that track individuals.** Plausible OK; no Google Analytics.
- **Every page renders without JavaScript.** Progressive enhancement only.
- **Editorial voice.** First-person plural ("we" = the historical society).
  Factual captions. Respect the dead.

---

## License

The code is released under MIT. The archive content (stories, photos,
documents) is governed by per-item rights — see each item's `rights` field.

Companion projects:
- **Our Westlake** (Buzzsprout podcast): https://feeds.buzzsprout.com/2079111.rss
- **Our Westlake on Facebook**: https://www.facebook.com/OurWestlake/
- **Eanes History Group videos** (WestBank Library): https://www.youtube.com/@westbanklibrary/videos
