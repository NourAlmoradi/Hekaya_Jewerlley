"use client";

import QRCode from "qrcode";

export async function generateQrDataUrl(
  text: string,
  size = 320,
  color: { dark?: string; light?: string } = {},
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: color.dark ?? "#c9a96e",
      light: color.light ?? "#ffffff",
    },
  });
}

export function memoryUrlFor(token: string): string {
  // Prefer the configured public site URL so QR images encode the real domain
  // even when generated on localhost or a preview deploy (a QR that points at
  // http://localhost:3000 is useless once printed on a card). Fall back to the
  // current origin, then to a relative path during SSR.
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (site) return `${site}/memory/${token}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/memory/${token}`;
  }
  return `/memory/${token}`;
}
