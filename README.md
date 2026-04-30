# ✨ Hekaya Jewellery | مجوهرات حكاية

> **Children's Jewellery with Dynamic QR Memory Codes**
> _"A Story in Every Piece" / "في كل قطعة… حكاية"_

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Hosted-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

---

## 🎯 What is Hekaya Jewellery?

Hekaya Jewellery is a **premium bilingual e-commerce store** specializing in children's Jewellery for the UAE market. Each eligible Jewellery piece comes with a **unique QR Memory code** that links to a private, PIN-protected digital memory page where parents can store up to 3 photos and a heartfelt message — creating a keepsake that lasts forever.

### ✨ Core Features

- 🛍️ **Full E-Commerce** — Browse, filter, cart, checkout, payment
- 🔲 **Dynamic QR Memory Codes** — Unique QR per order or per piece (customer chooses at checkout)
- 🔑 **PIN-Protected Memories** — 4-digit PIN required to view memory pages
- 🌐 **Bilingual (AR/EN)** — Full RTL/LTR support from Day 1 via `next-intl`
- 💎 **Quiet Luxury Aesthetic** — Clean, professional, minimal warm-gold design
- 📱 **Mobile-First** — Fully responsive across all screen sizes
- 💳 **Payments** — Apple Pay, Mastercard, and PayPal
- 📐 **Product Variations** — Size and material options with price overrides
- 📊 **Admin Dashboard** — Manage products, view/update orders

---

## 🏗️ Tech Stack

| Layer             | Technology            | Version     | Purpose                                   |
| ----------------- | --------------------- | ----------- | ----------------------------------------- |
| **Framework**     | Next.js (App Router)  | 16.2.4      | Pages, SSR, routing                       |
| **UI Language**   | React                 | 19.2.4      | Component model                           |
| **Language**      | TypeScript            | 5           | Type safety                               |
| **i18n**          | next-intl             | 4.x         | Bilingual AR/EN, RTL/LTR                  |
| **Styling**       | Tailwind CSS v4       | 4.x         | CSS-only config (`@theme` in globals.css) |
| **Animations**    | framer-motion         | 12.x        | Minimal whileInView fade-ups only         |
| **State**         | Zustand               | 5.x         | Cart + UI state (persisted)               |
| **Data Fetching** | TanStack React Query  | 5.x         | Server state management                   |
| **Forms**         | react-hook-form + zod | 7.x / 4.x   | Validated forms                           |
| **Database**      | Supabase (PostgreSQL) | —           | Data storage, RLS security                |
| **Auth**          | Supabase Auth         | —           | Email registration, login, reset          |
| **Image Storage** | Supabase Storage      | —           | Product images, memory photos             |
| **Payments**      | Stripe & PayPal       | —           | Apple Pay, Mastercard, and PayPal         |
| **QR Codes**      | qrcode + nanoid       | 1.5.x / 5.x | Dynamic QR generation                     |
| **Icons**         | Lucide React          | 1.x         | UI icons                                  |
| **Carousels**     | Embla Carousel        | 8.x         | Product image gallery                     |
| **Toasts**        | Sonner                | 2.x         | Notification toasts                       |
| **Email**         | Resend                | 6.x         | Transactional emails                      |
| **Image Opt**     | Sharp                 | 0.34.x      | Server-side image processing              |
| **Hosting**       | Vercel                | —           | CDN, SSL, auto-deploy                     |

> **Important:** Tailwind v4 uses a **CSS-only configuration** — there is no `tailwind.config.ts`. All design tokens live in the `@theme` block inside `src/app/globals.css`.

---

## 📁 Project Structure

```
Hekaya_Jewerly/               ← workspace root
├── docs/                     # 📖 Project documentation (all 10 files)
├── hekaya/                   ← Next.js project (run all commands from here)
│   ├── messages/
│   │   ├── ar.json           #    Arabic translations (full)
│   │   └── en.json           #    English translations (full)
│   │
│   ├── public/               # 🖼️ Static assets
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/     #    Bilingual routes (/ar/... and /en/...)
│   │   │   │   ├── layout.tsx           # Locale shell: fonts, dir, NextIntlProvider
│   │   │   │   ├── page.tsx             # Homepage
│   │   │   │   ├── products/page.tsx    # Shop All (filterable)
│   │   │   │   ├── product/[slug]/      # Product detail
│   │   │   │   ├── login/page.tsx       # Sign in
│   │   │   │   ├── register/page.tsx    # Create account
│   │   │   │   ├── forgot-password/     # Password reset
│   │   │   │   ├── checkout/page.tsx    # 3-step checkout
│   │   │   │   ├── account/page.tsx     # User dashboard
│   │   │   │   ├── memory/[token]/      # PIN-protected QR Memory page
│   │   │   │   ├── about/page.tsx       # Brand story
│   │   │   │   ├── contact/page.tsx     # Contact form
│   │   │   │   └── policies/page.tsx    # Tabbed: Shipping/Returns/Privacy/Terms
│   │   │   ├── layout.tsx    #    Root layout (minimal wrapper)
│   │   │   ├── page.tsx      #    Root → redirect('/ar')
│   │   │   └── globals.css   #    Tailwind v4 @theme + all CSS utilities
│   │   │
│   │   ├── components/
│   │   │   ├── layout/       #    Header, Footer, MobileMenu, LanguageSwitcher
│   │   │   ├── home/         #    HeroSection, BrandStoryStrip, CollectionShowcase,
│   │   │   │                 #    QRMemoryBanner, TestimonialCards, TrustBadges
│   │   │   ├── products/     #    ProductCard, ProductGrid, ProductDetail
│   │   │   ├── cart/         #    CartDrawer
│   │   │   └── ui/           #    Button, Badge, Input, Container, StarRating,
│   │   │                     #    BackToTop, WhatsAppFloat
│   │   │
│   │   ├── data/
│   │   │   └── products.ts   #    6 placeholder products (until Supabase is wired)
│   │   │
│   │   ├── i18n/
│   │   │   ├── routing.ts    #    next-intl locale routing config
│   │   │   └── request.ts    #    next-intl server request config
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase/     #    client.ts, server.ts, admin.ts
│   │   │   ├── format.ts     #    formatPrice, formatDate, truncate
│   │   │   └── utils.ts      #    cn() — clsx + tailwind-merge
│   │   │
│   │   ├── stores/
│   │   │   └── cart.store.ts #    Zustand cart (persisted, addItem/removeItem/etc.)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts      #    Product, Order, QRMemory, CartItem, Profile, etc.
│   │   │
│   │   └── proxy.ts          #    next-intl middleware (renamed for Next.js 16)
│   │
│   ├── next.config.ts
│   ├── .env.local            # 🔒 Env vars (NEVER commit)
│   └── package.json
│
├── PROJECT_WORKFLOW.md        # 📋 Business flow doc (for co-founder approval)
├── README.md                  # 👈 You are here
└── BUILD_GUIDE.md
```

---

## 🚦 Build Status

| Area                    | Status     | Notes                                                                    |
| ----------------------- | ---------- | ------------------------------------------------------------------------ |
| Project setup & routing | ✅ Done    | Next.js 16 + next-intl v4, AR default                                    |
| Design system           | ✅ Done    | Tailwind v4 `@theme`, all brand tokens                                   |
| Layout shell            | ✅ Done    | Header (z-50, frosted on scroll), Footer, MobileMenu                     |
| Cart system             | ✅ Done    | CartDrawer, Zustand store, persisted                                     |
| Homepage                | ✅ Done    | 6 sections: Hero, BrandStory, Collections, QRBanner, Testimonials, Trust |
| Product listing         | ✅ Done    | ProductCard + ProductGrid + filter by collection                         |
| Product detail          | ✅ Done    | Gallery, qty stepper, Add to Cart, QR callout                            |
| Placeholder data        | ✅ Done    | 6 products in `src/data/products.ts`                                     |
| Auth pages (UI)         | ✅ Done    | Login, Register, Forgot Password                                         |
| Checkout (UI)           | ✅ Done    | 3-step stepper: Shipping → Review → Payment                              |
| Static pages            | ✅ Done    | About, Contact, Policies (tabbed)                                        |
| Account page (shell)    | ✅ Done    | Login prompt / menu skeleton                                             |
| QR Memory page (shell)  | ✅ Done    | Memory viewer at `/memory/[token]`                                       |
| Supabase DB schema      | ❌ Pending | SQL not yet run in Supabase console                                      |
| Product variations      | ❌ Pending | Size/material options per product                                        |
| Real auth (Supabase)    | ❌ Pending | Forms built; `signIn`/`signUp` TODOs remain                              |
| Payment integration     | ❌ Pending | Stripe (Apple Pay/Mastercard) + PayPal integration                       |
| QR generation logic     | ❌ Pending | `src/lib/qr.ts` not created yet                                          |
| QR PIN system           | ❌ Pending | 4-digit PIN for memory page access                                       |
| Supabase Storage setup  | ❌ Pending | Image storage bucket not configured                                      |
| API routes              | ❌ Pending | `/api/checkout`, `/api/webhook`, `/api/qr`                               |
| Admin dashboard         | ❌ Pending | `/admin` not started                                                     |
| Account sub-pages       | ❌ Pending | Orders, Wishlist, Addresses                                              |
| My Memories editor      | ❌ Pending | Upload/edit interface for memory pages                                   |
| Order confirmation      | ❌ Pending | `/order-confirmation/[id]` not started                                   |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git installed

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/hekaya.git
cd Hekaya_Jewerly/hekaya      # ← must be in the hekaya/ subfolder
npm install
```

### 2. Set up Environment

```bash
# Copy and fill in your keys
cp .env.local.example .env.local   # or edit .env.local directly
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=+971XXXXXXXXX
ADMIN_EMAIL=admin@hekayaJewellery.com
```

### 3. Run Development Server

```bash
# Must run from inside the hekaya/ folder
cd hekaya
npm run dev
# Open http://localhost:3000  →  auto-redirects to /ar
```

### 4. Deploy to Production

```bash
git push origin main
# Vercel auto-deploys from GitHub
```

---

## ⚠️ Key Technical Notes

1. **Run commands from `hekaya/` subfolder** — `package.json` is inside `hekaya/`, not the workspace root.
2. **Tailwind v4 = CSS-only config** — No `tailwind.config.ts`. All tokens are in `@theme {}` block in `globals.css`.
3. **Next.js 16 middleware** — The routing proxy is `src/proxy.ts` (not `middleware.ts`) with a named export `proxy`. This is required for Next.js 16 compatibility.
4. **RTL support** — Arabic (`ar`) is the default locale. The `dir` attribute flips automatically in `[locale]/layout.tsx`.
5. **No shadcn/ui** — Custom UI components were built from scratch (`src/components/ui/`) to match the Quiet Luxury aesthetic precisely.
6. **z-index values are hardcoded** — Tailwind v4 does not support `z-[--css-var]` syntax. Use: Header `z-50`, Drawer panel `z-[41]`, Overlay `z-40`, Floats `z-30`.
7. **Payments: Apple Pay, Mastercard, PayPal** — Handled securely via Stripe and PayPal integrations.
8. **Image Storage: Supabase Storage** — Used for seamless integration with the database and auth ecosystem.

---

## 📖 Documentation

All detailed documentation lives in the `docs/` folder:

| File                                                    | Contents                                     |
| ------------------------------------------------------- | -------------------------------------------- |
| [00_PROJECT_OVERVIEW.md](docs/00_PROJECT_OVERVIEW.md)   | Executive summary, concept, business roadmap |
| [01_BRAND_DESIGN.md](docs/01_BRAND_DESIGN.md)           | Colors, fonts, values, aesthetic guide       |
| [02_TECH_ARCHITECTURE.md](docs/02_TECH_ARCHITECTURE.md) | Database schema, API routes, full SQL        |
| [03_PAGES_COMPONENTS.md](docs/03_PAGES_COMPONENTS.md)   | Every page & component mapped                |
| [04_QR_MEMORY_SYSTEM.md](docs/04_QR_MEMORY_SYSTEM.md)   | QR feature specification & flow              |
| [05_SECURITY_AUTH.md](docs/05_SECURITY_AUTH.md)         | Supabase Auth, RLS policies, security        |
| [06_PAYMENT_CHECKOUT.md](docs/06_PAYMENT_CHECKOUT.md)   | Payment gateway integration guide            |
| [07_DEPLOYMENT.md](docs/07_DEPLOYMENT.md)               | Vercel setup, domain, monitoring             |
| [08_COST_BREAKDOWN.md](docs/08_COST_BREAKDOWN.md)       | Budget at every growth stage                 |
| [09_BUILD_ROADMAP.md](docs/09_BUILD_ROADMAP.md)         | 8-week step-by-step build plan               |
| [PROJECT_WORKFLOW.md](PROJECT_WORKFLOW.md)               | Business flow doc (for co-founder approval)  |

---

## 💰 Cost

| Phase      | Monthly Cost   | Notes                           |
| ---------- | -------------- | ------------------------------- |
| **Launch** | $0/month       | Free tiers + domain (~$12/year) |
| **Growth** | ~$45/month     | Vercel Pro + Supabase Pro       |
| **Scale**  | ~$100–200/month | Additional services as needed   |

_Plus transaction fees (Stripe/PayPal processing)_

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with 💕 for Hekaya Jewellery<br>
  <strong>hekaya-Jewellery.com</strong>
</p>
