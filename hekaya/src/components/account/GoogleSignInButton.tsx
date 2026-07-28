"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/utils";
import { toast } from "sonner";

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_ID = "google-gsi-client";

/** SHA-256 of `input`, hex-encoded (browser SubtleCrypto). */
async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Load Google Identity Services once; resolve when window.google is ready. */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/**
 * "Sign in with Google" using Google Identity Services + Supabase's
 * signInWithIdToken. The OAuth handshake runs directly between the browser and
 * Google (origin = this site), so Google's screen shows OUR domain and the
 * Supabase project URL never appears — unlike the redirect-based
 * signInWithOAuth flow, which routes through `<ref>.supabase.co`.
 *
 * Security: a per-render nonce is hashed before it goes to Google and the raw
 * value is handed to Supabase, which re-hashes and compares — binding the
 * returned ID token to this exact request.
 */
export function GoogleSignInButton({ ar }: { ar: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Mirror AuthForm: honor ?redirect=/checkout, internal paths only.
  const dest = safeRedirectPath(searchParams.get("redirect"));
  const containerRef = useRef<HTMLDivElement>(null);
  const rawNonceRef = useRef("");

  const onCredential = useCallback(
    async ({ credential }: CredentialResponse) => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
        nonce: rawNonceRef.current,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(ar ? "تم تسجيل الدخول" : "Signed in");
      router.replace(dest);
    },
    [ar, router, dest],
  );

  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google sign-in is disabled.",
      );
      return;
    }
    let cancelled = false;

    (async () => {
      const rawNonce = crypto.randomUUID();
      const hashedNonce = await sha256Hex(rawNonce);
      await loadGsiScript();
      if (cancelled || !window.google || !containerRef.current) return;

      rawNonceRef.current = rawNonce;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: onCredential,
        nonce: hashedNonce,
      });

      // Google's button takes a fixed pixel width (max 400); size it to the
      // form column so it lines up with the inputs above it.
      const width = Math.min(
        Math.max(containerRef.current.clientWidth, 200),
        400,
      );
      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "center",
        locale: ar ? "ar" : "en",
        width,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [ar, onCredential]);

  if (!CLIENT_ID) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}
