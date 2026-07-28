"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

/**
 * Styled confirmation dialog, replacing native `confirm()` (finding M14).
 *
 * Native dialogs were used in seven places across admin products, collections,
 * QR and the account page. They cannot be styled or RTL-aligned, look nothing
 * like the dark admin UI, and — the real problem — some corporate browser
 * policies suppress them outright, in which case `confirm()` returns `false`
 * and the delete silently does nothing at all.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  /** Red confirm button. True for deletes (the default). */
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { t } = useT();

  // Focus the confirm button and wire Escape, so the dialog is usable from the
  // keyboard the way the native one was.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4"
          onClick={onCancel}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-2xl"
          >
            <div className="flex gap-3 px-5 py-5">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  destructive
                    ? "bg-rose-500/15 text-rose-400"
                    : "bg-[#c9a96e]/15 text-[#c9a96e]",
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                {message && (
                  <p className="mt-1 text-sm leading-relaxed text-white/60">
                    {message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3">
              <button
                onClick={onCancel}
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={busy}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-50",
                  destructive
                    ? "bg-rose-500/90 text-white hover:bg-rose-500"
                    : "bg-[#c9a96e] text-[#1a1a1a] hover:bg-[#d8bb85]",
                )}
              >
                {busy ? t("loading") : (confirmLabel ?? t("delete"))}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
