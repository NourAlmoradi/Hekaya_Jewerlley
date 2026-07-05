import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Amiri,
  Noto_Sans_Arabic,
} from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Providers } from "@/components/Providers";
import type { Locale } from "@/types";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-arabic",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mashaerjewellery.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Mashaer Jewellery — Some Feelings Deserve Eternity | مجوهرات مشاعر",
    template: "%s | Mashaer Jewellery",
  },
  description:
    "Premium children's jewellery for the UAE — every piece comes with a private QR Memory card to keep your moments forever. مجوهرات أطفال فاخرة مع بطاقة ذكرى رقمية.",
  applicationName: "Mashaer Jewellery",
  keywords: [
    "jewellery",
    "UAE",
    "children",
    "QR memory",
    "Mashaer",
    "مجوهرات",
    "مشاعر",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "مجوهرات مشاعر | Mashaer Jewellery",
    description: "Some Feelings Deserve Eternity — بعض المشاعر تستحق الخلود",
    type: "website",
    url: SITE_URL,
    siteName: "مجوهرات مشاعر",
    locale: "ar_AE",
    alternateLocale: "en_AE",
    images: [
      {
        url: "/logo.jpeg",
        width: 1254,
        height: 1254,
        alt: "Mashaer Jewellery — مجوهرات مشاعر",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mashaer Jewellery",
    description: "Some Feelings Deserve Eternity — بعض المشاعر تستحق الخلود",
    images: ["/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mashaer Jewellery",
  alternateName: "مجوهرات مشاعر",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpeg`,
  slogan: "Some Feelings Deserve Eternity",
  areaServed: "AE",
  email: "hello@mashaerjewellery.com",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "مجوهرات مشاعر",
  alternateName: "Mashaer Jewellery",
  url: SITE_URL,
  inLanguage: ["ar-AE", "en-AE"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("mashaer-locale")?.value;
  const locale: Locale = cookieLocale === "en" ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${amiri.variable} ${notoArabic.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        <Providers initialLocale={locale}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
