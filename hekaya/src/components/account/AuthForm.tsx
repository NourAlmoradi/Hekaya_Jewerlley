"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useT } from "@/lib/useT";
import {
  MIN_PASSWORD_NEW,
  MIN_PASSWORD_SIGNIN,
  safeRedirectPath,
} from "@/lib/utils";
import { useAuth } from "@/lib/supabase/useAuth";
import { GoogleSignInButton } from "@/components/account/GoogleSignInButton";
import { toast } from "sonner";

/**
 * Real email/password auth form (sign in + sign up) backed by Supabase.
 * Replaces the old one-click mock-login button.
 *
 * `onAuthenticated` fires the moment a session exists, before the redirect is
 * issued. Host pages render this form behind a `!user` check, so without that
 * signal they'd swap in their signed-in view the instant Supabase publishes the
 * session — flashing the account dashboard for a frame on the way to `dest`.
 */
export function AuthForm({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { t, locale } = useT();
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where to land after auth — e.g. /account?redirect=/checkout sends the user
  // straight back to checkout. Only allow internal paths.
  const dest = safeRedirectPath(searchParams.get("redirect"));
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const ar = locale === "ar";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    // Set once a redirect is under way, so the `finally` below leaves the
    // submit button disabled instead of briefly re-enabling it while
    // router.replace is still fetching `dest`.
    let leaving = false;
    try {
      if (mode === "signin") {
        const err = await signIn(email, password);
        if (err) {
          toast.error(err);
        } else {
          toast.success(ar ? "تم تسجيل الدخول" : "Signed in");
          leaving = true;
          onAuthenticated?.();
          router.replace(dest);
        }
      } else if (mode === "forgot") {
        const { createClient } = await import("@/lib/supabase/client");
        const { error } = await createClient().auth.resetPasswordForEmail(
          email,
          { redirectTo: `${window.location.origin}/account/reset-password` },
        );
        if (error) {
          toast.error(error.message);
        } else {
          toast.success(
            ar
              ? "تحقق من بريدك — أرسلنا رابط إعادة تعيين كلمة المرور."
              : "Check your email — we sent a password reset link.",
          );
          setMode("signin");
        }
      } else {
        const err = await signUp(email, password, fullName);
        if (err) {
          toast.error(err);
        } else {
          // Email confirmation is disabled, so signup signs the user in
          // immediately — send them on to their original destination.
          toast.success(ar ? "تم إنشاء حسابك بنجاح" : "Account created");
          leaving = true;
          onAuthenticated?.();
          router.replace(dest);
        }
      }
    } finally {
      if (!leaving) setBusy(false);
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
          <User className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-center font-display text-3xl font-semibold">
          {mode === "signin"
            ? t("login")
            : mode === "forgot"
              ? ar
                ? "استعادة كلمة المرور"
                : "Reset password"
              : ar
                ? "إنشاء حساب"
                : "Create account"}
        </h1>

        <form onSubmit={submit} className="mt-6 space-y-4 text-start">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                {ar ? "الاسم الكامل" : "Full name"}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("email")}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                {ar ? "كلمة المرور" : "Password"}
              </label>
              <input
                type="password"
                required
                // Only NEW passwords must meet the raised minimum — existing
                // accounts may still have a 6-character one.
                minLength={
                  mode === "signup" ? MIN_PASSWORD_NEW : MIN_PASSWORD_SIGNIN
                }
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary-dark)]"
              />
              {mode === "signup" && (
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {ar
                    ? `${MIN_PASSWORD_NEW} أحرف على الأقل`
                    : `At least ${MIN_PASSWORD_NEW} characters`}
                </p>
              )}
            </div>
          )}
          {mode === "signin" && (
            <div className="text-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-[var(--color-primary-dark)] hover:underline"
              >
                {ar ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="btn btn-gold btn-lg w-full disabled:opacity-60"
          >
            {busy
              ? ar
                ? "جارٍ…"
                : "Please wait…"
              : mode === "signin"
                ? t("login")
                : mode === "forgot"
                  ? ar
                    ? "إرسال رابط الاستعادة"
                    : "Send reset link"
                  : ar
                    ? "إنشاء حساب"
                    : "Create account"}
          </button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              {ar ? "أو" : "or"}
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            <GoogleSignInButton ar={ar} onAuthenticated={onAuthenticated} />
          </>
        )}

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-[var(--color-primary-dark)] hover:underline"
        >
          {mode === "signin"
            ? ar
              ? "ليس لديك حساب؟ أنشئ حسابًا"
              : "No account? Create one"
            : ar
              ? "لديك حساب؟ سجّل الدخول"
              : "Have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}
