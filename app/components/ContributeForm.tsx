"use client";

import { useState } from "react";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "ok"; message: string; url?: string }
  | { state: "error"; message: string };

const KINDS: { value: string; label: string; hint: string }[] = [
  {
    value: "photo",
    label: "Photograph",
    hint: "A historical photograph (you have rights to share, or it's a family photo).",
  },
  {
    value: "story",
    label: "Story or memory",
    hint: "Something you remember, or a story passed down to you.",
  },
  {
    value: "audio",
    label: "Audio recording",
    hint: "An interview, oral history, or other recording.",
  },
  {
    value: "video",
    label: "Video",
    hint: "Home movies, lectures, oral histories on video.",
  },
  {
    value: "document",
    label: "Document",
    hint: "Letters, deeds, programs, news clippings, yearbooks…",
  },
  { value: "other", label: "Something else", hint: "" },
];

const COLLECTIONS = [
  { value: "", label: "Not sure / let curators decide" },
  { value: "westlake-historical-society", label: "Westlake Historical Society" },
  { value: "eanes-history-center", label: "Eanes History Center" },
  { value: "eanes-history-group", label: "Eanes History Group" },
  { value: "schools", label: "Schools" },
  { value: "churches", label: "Churches" },
  { value: "cedar-choppers", label: "Cedar Choppers" },
  { value: "rollingwood", label: "Rollingwood" },
];

export function ContributeForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [kind, setKind] = useState("photo");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ state: "submitting" });
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        note?: string;
        url?: string;
        error?: string;
        fields?: string[];
      };
      if (json.ok) {
        setStatus({
          state: "ok",
          message:
            json.note ??
            "Thanks. Your contribution has been received and will be reviewed.",
          url: json.url,
        });
        e.currentTarget.reset();
        setKind("photo");
      } else if (json.error === "missing_fields") {
        setStatus({
          state: "error",
          message: `Please fill in: ${json.fields?.join(", ")}`,
        });
      } else {
        setStatus({
          state: "error",
          message:
            json.note ??
            "Something went wrong submitting the form. Please email contribute@westlakehistory.com.",
        });
      }
    } catch {
      setStatus({
        state: "error",
        message:
          "We couldn't reach the server. Please try again, or email contribute@westlakehistory.com.",
      });
    }
  };

  if (status.state === "ok") {
    return (
      <div className="mt-12 border border-rule bg-limestone/40 p-6 md:p-8">
        <p className="label-archival mb-3 text-cedar">Submission received</p>
        <h2 className="font-display text-[24px] leading-tight text-ink">
          Thank you.
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-mute">
          {status.message}
        </p>
        {status.url ? (
          <p className="meta-line mt-4 text-ink-mute">
            Tracking reference:{" "}
            <a
              href={status.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
            >
              GitHub issue
            </a>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus({ state: "idle" })}
          className="meta-line mt-6 border-b border-cedar/50 pb-px text-cedar hover:border-cedar"
        >
          Submit another contribution →
        </button>
      </div>
    );
  }

  const submitting = status.state === "submitting";
  const currentKindHint = KINDS.find((k) => k.value === kind)?.hint;

  return (
    <form
      onSubmit={onSubmit}
      className="mt-12 grid gap-6 border border-rule bg-paper p-6 md:p-8"
      aria-label="Contribution form"
    >
      <h2 className="font-display text-[22px] leading-tight text-ink">
        Send us your contribution
      </h2>
      <p className="meta-line -mt-3 text-ink-mute">
        All fields except media URL are required. We&apos;ll follow up by
        email before publishing anything.
      </p>

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <Field label="Your name" name="name" required />
      <Field
        label="Email"
        name="email"
        type="email"
        required
        hint="We'll only use this to follow up about your contribution."
      />
      <Field
        label="Your relationship to the material"
        name="role"
        hint="e.g. 'My grandmother lived in West Lake Hills in the 1950s' — optional but helpful."
      />

      <fieldset className="grid gap-2">
        <legend className="label-archival mb-1 text-ink-mute">
          What are you contributing? <span className="text-cedar">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {KINDS.map((k) => (
            <label
              key={k.value}
              className={
                "flex cursor-pointer items-start gap-3 border border-rule px-4 py-3 transition-colors " +
                (kind === k.value
                  ? "border-oak bg-limestone/40"
                  : "hover:border-oak/50 hover:bg-limestone/20")
              }
            >
              <input
                type="radio"
                name="kind"
                value={k.value}
                checked={kind === k.value}
                onChange={() => setKind(k.value)}
                className="mt-1 h-4 w-4 cursor-pointer accent-oak"
              />
              <span className="text-[14.5px] text-ink">{k.label}</span>
            </label>
          ))}
        </div>
        {currentKindHint ? (
          <p className="meta-line mt-1 text-ink-mute">{currentKindHint}</p>
        ) : null}
      </fieldset>

      <label className="grid gap-2">
        <span className="label-archival text-ink-mute">
          Suggested collection
        </span>
        <select
          name="collection"
          className="border border-rule bg-paper px-3 py-2.5 text-[14.5px] text-ink"
          defaultValue=""
        >
          {COLLECTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="label-archival text-ink-mute">
          Description <span className="text-cedar">*</span>
        </span>
        <textarea
          name="description"
          required
          rows={6}
          minLength={10}
          placeholder="What is this material? Who, when, where? What story does it tell?"
          className="resize-y border border-rule bg-paper px-3 py-2.5 text-[14.5px] leading-relaxed text-ink placeholder:text-ink-mute/70"
        />
      </label>

      <Field
        label="Link to media (optional)"
        name="mediaUrl"
        type="url"
        hint="Paste a link to a Google Drive / Dropbox / iCloud share, a YouTube video, or any URL where we can find the file. We'll handle hosting after review."
      />

      <Field
        label="Rights / permissions notes (optional)"
        name="rights"
        hint="Anything we should know about who owns this material, who's pictured, or any restrictions on its use."
      />

      <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-5">
        <button
          type="submit"
          disabled={submitting}
          className="bg-oak px-7 py-3 text-[15px] font-medium text-paper transition-colors hover:bg-oak-deep disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send contribution"}
        </button>
        <p className="meta-line text-ink-mute">
          Or email{" "}
          <a
            href="mailto:contribute@westlakehistory.com"
            className="border-b border-cedar/50 text-ink hover:border-cedar hover:text-cedar"
          >
            contribute@westlakehistory.com
          </a>
        </p>
      </div>

      {status.state === "error" ? (
        <p className="border-t border-rule pt-4 text-[13.5px] text-cedar">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="label-archival text-ink-mute">
        {label} {required ? <span className="text-cedar">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={
          name === "email"
            ? "email"
            : name === "name"
              ? "name"
              : undefined
        }
        className="border border-rule bg-paper px-3 py-2.5 text-[14.5px] text-ink"
      />
      {hint ? <p className="meta-line text-ink-mute">{hint}</p> : null}
    </label>
  );
}
