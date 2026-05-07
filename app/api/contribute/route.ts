/**
 * Contribute submission endpoint.
 *
 * Receives a JSON payload from /contribute and (when GitHub is wired)
 * opens a triage issue in the archive's repo so a curator can review
 * and import the contribution. If GitHub credentials aren't set, the
 * payload is logged to the server console so you can still see what
 * came in during local development.
 *
 * Required environment variables for full functionality:
 *   GITHUB_REPO     — e.g. "benpeays-blip/westlakehistory"
 *   GITHUB_TOKEN    — fine-grained PAT with Issues: Read & Write on
 *                      that repo. Vercel: Settings → Environment Variables.
 *
 * Optional:
 *   GITHUB_LABEL    — defaults to "contribution" (created on first issue)
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface Submission {
  name: string;
  email: string;
  role?: string;
  kind: string; // photo | story | audio | video | document | other
  collection?: string;
  description: string;
  mediaUrl?: string;
  rights?: string;
  // honeypot for bot prevention
  website?: string;
}

const KIND_LABEL: Record<string, string> = {
  photo: "Photograph",
  story: "Story",
  audio: "Audio recording",
  video: "Video",
  document: "Document",
  other: "Other",
};

export async function POST(req: Request) {
  let body: Submission;
  try {
    body = (await req.json()) as Submission;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Bot honeypot — real users leave the hidden `website` field empty
  if (body.website && body.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Basic validation
  const errors: string[] = [];
  if (!body.name?.trim()) errors.push("name");
  if (!body.email?.trim() || !/.+@.+\..+/.test(body.email)) errors.push("email");
  if (!body.description?.trim() || body.description.length < 10)
    errors.push("description");
  if (!body.kind) errors.push("kind");
  if (errors.length) {
    return NextResponse.json(
      { error: "missing_fields", fields: errors },
      { status: 422 },
    );
  }

  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const label = process.env.GITHUB_LABEL ?? "contribution";

  const title = `[${KIND_LABEL[body.kind] ?? "Contribution"}] ${body.description.slice(0, 70)}…`;
  const issueBody = formatIssueBody(body);

  if (!repo || !token) {
    // Log the submission so it's at least visible in Vercel logs.
    console.warn(
      "[contribute] received submission, but GITHUB_REPO/GITHUB_TOKEN are not set; payload follows:",
      { ...body, email: redactEmail(body.email) },
    );
    return NextResponse.json(
      {
        ok: true,
        delivery: "logged",
        note:
          "Thanks. Your submission was received. (Admin review pipeline is being configured; we may follow up by email.)",
      },
      { status: 200 },
    );
  }

  const apiRes = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body: issueBody,
      labels: [label],
    }),
  });

  if (!apiRes.ok) {
    const text = await apiRes.text();
    console.error("[contribute] GitHub issue creation failed", apiRes.status, text);
    return NextResponse.json(
      {
        error: "submission_received_but_undelivered",
        note:
          "We received your submission but the admin notification didn't go through. We'll review the server logs and follow up.",
      },
      { status: 502 },
    );
  }

  const issue = (await apiRes.json()) as { html_url: string; number: number };
  return NextResponse.json(
    {
      ok: true,
      delivery: "github_issue",
      issue: issue.number,
      url: issue.html_url,
    },
    { status: 201 },
  );
}

function formatIssueBody(s: Submission): string {
  const lines = [
    `**Submitted by:** ${s.name} (${s.email})`,
    s.role ? `**Role / relationship:** ${s.role}` : "",
    `**Kind:** ${KIND_LABEL[s.kind] ?? s.kind}`,
    s.collection ? `**Suggested collection:** ${s.collection}` : "",
    s.mediaUrl ? `**Media URL:** ${s.mediaUrl}` : "",
    s.rights ? `**Rights / permissions:** ${s.rights}` : "",
    "",
    "## Description",
    "",
    s.description,
    "",
    "---",
    "",
    "_Auto-filed from /contribute. Review and, if appropriate, transcribe into MDX in the relevant /content/ folder._",
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}
