"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { useT } from "@/lib/useT";
import { MIN_PASSWORD_NEW } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Landing page for the Supabase password-recovery email link.
 * The link contains a recovery token; Supabase signs the user in with a
 * temporary session, then we let them set a new password via updateUser.
 */
export default function ResetPasswordPage() {
  const { locale } = useT();
  const router = useRouter();
  const ar = locale === "ar";
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // Establish the recovery session. Supabase reset links arrive either as
  // a PKCE `?code=...` param (must be exchanged explicitly) or as a hash
  // token that fires the PASSWORD_RECOVERY auth event.
  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");
    const tokenHash = params.get("token_hash");

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) setLinkError(error.message);
          else setReady(true);
        })
        .catch((err: Error) => setLinkError(err.message));
    } else if (tokenHash) {
      supabase.auth
        .verifyOtp({ type: "recovery", token_hash: tokenHash })
        .then(({ error }) => {
          if (error) setLinkError(error.message);
          else setReady(true);
        })
        .catch((err: Error) => setLinkError(err.message));
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      toast.error(ar ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          ar ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully",
        );
        router.replace("/account");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-h py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-md ring-1 ring-[var(--color-border)]"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-center font-display text-3xl font-semibold">
          {ar ? "كلمة مرور جديدة" : "New password"}
        </h1>

        {!ready ? (
          <div className="mt-6 space-y-3 text-center text-sm text-[var(--color-ink-muted)]">
            <p>
              {ar
                ? "افتح هذه الصفحة من رابط الاستعادة المرسل إلى بريدك. إذا انتهت صلاحية الرابط فاطلب رابطًا جديدًا."
                : "Open this page from the reset link sent to your email. If the link expired, request a new one."}
            </p>
            {linkError && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                dir="ltr"
              >
                {linkError}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4 text-start">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {ar ? "كلمة المرور الجديدة" : "New password"}
              </label>
              <input
                type="password"
                required
                minLength={MIN_PASSWORD_NEW}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {ar ? "تأكيد كلمة المرور" : "Confirm password"}
              </label>
              <input
                type="password"
                required
                minLength={MIN_PASSWORD_NEW}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-gold btn-lg w-full disabled:opacity-60"
            >
              {busy
                ? ar
                  ? "جارٍ…"
                  : "Please wait…"
                : ar
                  ? "تحديث كلمة المرور"
                  : "Update password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
