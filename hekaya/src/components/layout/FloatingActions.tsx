"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useT } from "@/lib/useT";
import { useAdminSettings } from "@/stores/adminSettings.store";
import { cn, whatsappUrl } from "@/lib/utils";

export function FloatingActions() {
  const { t } = useT();
  const whatsapp = useAdminSettings((s) => s.store.whatsapp);
  const waUrl = whatsappUrl(whatsapp);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 z-30 flex flex-col gap-3 ltr:right-5 rtl:left-5">
      {/* Hidden entirely until a real WhatsApp number is set in Admin → Settings:
          a dead button is worse than no button on the main mobile contact route. */}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("whatsapp_us")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-whatsapp)] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("back_to_top")}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-ink)] text-white shadow-lg transition hover:scale-105 hover:bg-[var(--color-primary)]",
          show
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
