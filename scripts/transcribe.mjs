#!/usr/bin/env node

/**
 * Transcription scaffold for the audio archive.
 *
 * Walks every /content/audio/*.mdx entry that has an `audioFile` and no
 * accompanying transcript file, then:
 *   1. downloads the MP3 to a tmp file
 *   2. submits it to the OpenAI Whisper API (verbose_json with word
 *      timestamps) using the user-provided OPENAI_API_KEY
 *   3. writes the timecoded transcript to
 *      /content/audio/<slug>.transcript.json
 *   4. updates the MDX frontmatter to point at the transcript file
 *
 * Designed to run locally (or from a GitHub Action with secrets) — never
 * at request time. Each MP3 takes seconds to upload + tens of seconds
 * to transcribe; ~30 hours of source audio = ~$11 at current pricing.
 *
 * USAGE:
 *
 *   OPENAI_API_KEY=sk-... pnpm transcribe                  # all eligible
 *   OPENAI_API_KEY=sk-... pnpm transcribe ep-105-...       # just one
 *
 * STATUS:
 *
 *   This script is intentionally a scaffold. The OPENAI_API_KEY is not
 *   committed anywhere — you will be prompted in a future commit to add
 *   the key as a Vercel/GitHub secret. Until then, the function below
 *   exits with a polite message rather than running.
 */

import { readdir, readFile, writeFile, stat, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUDIO_DIR = join(ROOT, "content", "audio");
const TMP_DIR = join(ROOT, ".tmp", "audio");

const apiKey = process.env.OPENAI_API_KEY;
const targetSlug = process.argv[2];

if (!apiKey) {
  console.log(
    [
      "",
      "OPENAI_API_KEY is not set.",
      "",
      "Add the key to your shell, e.g.:",
      "  export OPENAI_API_KEY=sk-...",
      "  pnpm transcribe                    # all eligible audio entries",
      "  pnpm transcribe <slug>             # just one entry",
      "",
      "On Vercel: Settings → Environment Variables → OPENAI_API_KEY",
      "On GitHub: Settings → Secrets → Actions → OPENAI_API_KEY",
      "",
      "Until then this script exits without running. The Audio detail",
      "pages already render the player and the transcript-pending notice",
      "without any transcript file.",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

await mkdir(TMP_DIR, { recursive: true });

const entries = await readdir(AUDIO_DIR);
let processed = 0;
let skipped = 0;
let failed = 0;

for (const name of entries) {
  if (!name.endsWith(".mdx")) continue;
  const slug = name.replace(/\.mdx$/, "");
  if (targetSlug && slug !== targetSlug) continue;

  const mdxPath = join(AUDIO_DIR, name);
  const transcriptPath = join(AUDIO_DIR, `${slug}.transcript.json`);
  const raw = await readFile(mdxPath, "utf8");
  const { data, content } = matter(raw);

  if (!data.audioFile) {
    console.log(`  skip ${slug} — no audioFile`);
    skipped++;
    continue;
  }
  if (await exists(transcriptPath)) {
    console.log(`  skip ${slug} — transcript already exists`);
    skipped++;
    continue;
  }

  const mp3 = join(TMP_DIR, `${slug}.mp3`);
  try {
    if (!(await exists(mp3))) {
      console.log(`  fetch ${slug} ← ${data.audioFile}`);
      const res = await fetch(data.audioFile);
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(mp3, buf);
    }

    console.log(`  whisper ${slug}`);
    const fd = new FormData();
    fd.set("file", new Blob([await readFile(mp3)]), `${slug}.mp3`);
    fd.set("model", "whisper-1");
    fd.set("response_format", "verbose_json");
    fd.set("timestamp_granularities[]", "segment");
    const res = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: fd,
      },
    );
    if (!res.ok) throw new Error(`whisper failed: ${res.status} ${await res.text()}`);
    const json = await res.json();

    const transcript = (json.segments ?? []).map((s) => ({
      time: formatTimestamp(s.start),
      seconds: Math.floor(s.start),
      text: s.text.trim(),
    }));

    await writeFile(transcriptPath, JSON.stringify(transcript, null, 2));

    // Update MDX frontmatter to point at the new file
    if (data.transcript !== `/content/audio/${slug}.transcript.json`) {
      data.transcript = `/content/audio/${slug}.transcript.json`;
      await writeFile(mdxPath, matter.stringify(content, data));
    }

    console.log(`  done  ${slug} (${transcript.length} segments)`);
    processed++;
  } catch (err) {
    console.error(`  FAIL  ${slug}: ${err.message}`);
    failed++;
  }
}

console.log(`\n  processed=${processed} skipped=${skipped} failed=${failed}`);
if (failed > 0) process.exit(1);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function formatTimestamp(seconds) {
  const total = Math.floor(seconds);
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (hh > 0)
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}
