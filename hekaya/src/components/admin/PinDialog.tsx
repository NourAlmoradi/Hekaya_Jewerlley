"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound } from "lucide-react";
import { useT } from "@/lib/useT";

/**
 * 4-digit PIN entry, replacing `window.prompt` (finding M14).
 *
 * `prompt` showed the PIN in plain text on screen, offered no validation until
 * after submit, could not be RTL-aligned or styled, and is suppressed entirely
 * by some corporate browser policies.
 */
export function PinDialog({
  open,
  title,
  message,
  busy = false,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  busy?: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}) {
  const { t } = useT();
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      // Autofocus once the dialog has mounted.
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // Validate as they type rather than after submitting, which is what `prompt`
  // forced us to do.
  const valid = /^\d{4}$/.test(pin);

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
          <motion.form
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (valid && !busy) onSubmit(pin);
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-2xl"
          >
            <div className="flex gap-3 px-5 py-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c9a96e]/15 text-[#c9a96e]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                {message && (
                  <p className="mt-1 text-sm leading-relaxed text-white/60">
                    {message}
                  </p>
                )}
                <input
                  ref={inputRef}
                  // Masked: the old prompt() displayed the PIN in the clear.
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  dir="ltr"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="••••"
                  className="mt-3 w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-center text-lg tracking-[0.5em] text-white focus:border-[#c9a96e]/40 focus:outline-none"
                />
                {pin.length > 0 && !valid && (
                  <p className="mt-1 text-xs text-rose-400">
                    {t("admin_pin_must_be_4")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={!valid || busy}
                className="rounded-md bg-[#c9a96e] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#d8bb85] disabled:opacity-50"
              >
                {busy ? t("loading") : t("save")}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
