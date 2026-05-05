"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimal accessible audio player.
 *
 * Uses native <audio> for transport so screen readers and the browser's
 * media-session API both work for free. Custom-styled buttons sit on top:
 * play/pause, skip-15, skip-back-15, speed control. A visualizer is
 * rendered as a CSS-only sparkline (no waveform decoder until the
 * transcript pipeline lands and we can show real chapter markers).
 *
 * The seek bar is a controlled slider bound to currentTime — no Plyr or
 * Howler dependency yet; the brief allows lightweight here.
 */
export function AudioPlayer({
  src,
  title,
  subtitle,
}: {
  src: string;
  title: string;
  subtitle?: string;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onLoaded = () => setDuration(a.duration || 0);
    const onTime = () => setTime(a.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => setPlaying(false);
    const onError = () => setError("This recording could not be loaded.");
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = rate;
  }, [rate]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => setError("Playback was blocked by the browser."));
    } else {
      a.pause();
    }
  };

  const skip = (s: number) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + s));
  };

  const seek = (v: number) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = v;
    setTime(v);
  };

  return (
    <div className="border border-rule bg-paper p-5 md:p-6">
      <audio ref={ref} src={src} preload="metadata" />

      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="label-archival text-cedar">Now playing</p>
          <h3 className="mt-1.5 truncate font-display text-[18px] leading-tight text-ink">
            {title}
          </h3>
          {subtitle ? (
            <p className="meta-line mt-1 text-ink-mute">{subtitle}</p>
          ) : null}
        </div>
        <SpeedControl rate={rate} onChange={setRate} />
      </div>

      <Sparkline progress={duration ? time / duration : 0} />

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          aria-label="Back 15 seconds"
          onClick={() => skip(-15)}
          className="rounded-full border border-rule px-3 py-1.5 font-mono text-[12px] text-ink-mute transition-colors hover:border-oak hover:text-oak"
        >
          ← 15
        </button>

        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={toggle}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-oak text-paper transition-colors hover:bg-oak-deep"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M7 5v14l12-7z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          aria-label="Forward 15 seconds"
          onClick={() => skip(15)}
          className="rounded-full border border-rule px-3 py-1.5 font-mono text-[12px] text-ink-mute transition-colors hover:border-oak hover:text-oak"
        >
          15 →
        </button>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="ml-2 flex-1 cursor-pointer accent-oak"
        />

        <span className="meta-line w-24 text-right text-ink-mute">
          {fmt(time)} / {fmt(duration)}
        </span>
      </div>

      {error ? (
        <p className="mt-4 text-[13px] text-cedar">{error}</p>
      ) : null}
    </div>
  );
}

function SpeedControl({
  rate,
  onChange,
}: {
  rate: number;
  onChange: (r: number) => void;
}) {
  const next = () => {
    const seq = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const i = seq.indexOf(rate);
    onChange(seq[(i + 1) % seq.length]);
  };
  return (
    <button
      type="button"
      onClick={next}
      aria-label={`Playback speed ${rate}×`}
      className="meta-line rounded-full border border-rule px-3 py-1 text-ink-mute transition-colors hover:border-oak hover:text-oak"
    >
      {rate}×
    </button>
  );
}

function Sparkline({ progress }: { progress: number }) {
  const w = 480;
  const bars = 64;
  // Stable pseudo-waveform — same shape every render.
  const heights = Array.from({ length: bars }, (_, i) => {
    const a = Math.sin(i * 0.5) * 0.5 + 0.5;
    const b = Math.sin(i * 0.13 + 1.7) * 0.3 + 0.5;
    return Math.max(0.1, (a + b) / 2);
  });
  const cut = Math.floor(progress * bars);

  return (
    <svg
      viewBox={`0 0 ${w} 60`}
      preserveAspectRatio="none"
      className="mt-5 h-12 w-full"
      aria-hidden="true"
    >
      {heights.map((h, i) => {
        const barW = w / bars;
        const barH = h * 50;
        const y = (60 - barH) / 2;
        return (
          <rect
            key={i}
            x={i * barW + 0.5}
            y={y}
            width={barW - 1}
            height={barH}
            fill={i < cut ? "#2f4a3d" : "#cfc7b3"}
          />
        );
      })}
    </svg>
  );
}

function fmt(s: number): string {
  if (!Number.isFinite(s)) return "0:00";
  const total = Math.max(0, Math.floor(s));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}
