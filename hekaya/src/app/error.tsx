"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useT } from "@/lib/useT";

/**
 * Route error boundary.
 *
 * Two fixes (M1):
 *  - Localised via useT() — it was hardcoded English on an Arabic-default site.
 *  - The buttons carry the `btn` base class. `btn-gold` / `btn-outline` set only
 *    colours; `.btn` supplies the layout, so without it these rendered as
 *    unpadded square gold text.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    // Surface for monitoring. Replace with Sentry's captureException once
    // @sentry/nextjs is wired up (H11).
    console.error(error);
  }, [error]);

  return (
    <div className="container-h flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
        {t("error_eyebrow")}
      </p>
      <h1 className="fs-display-md max-w-xl text-[var(--color-ink)]">
        {t("error_title")}
      </h1>
      <p className="max-w-md text-[var(--color-ink-muted)]">
        {t("error_body")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn btn-gold btn-lg">
          {t("try_again")}
        </button>
        <Link href="/" className="btn btn-outline btn-lg">
          {t("back_to_home")}
        </Link>
      </div>
    </div>
  );
}
