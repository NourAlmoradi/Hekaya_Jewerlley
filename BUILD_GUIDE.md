# 💎 Hekaya Jewelry — Complete Build Guide (Start to Finish)

> **The ultimate step-by-step guide to build, deploy, and launch Hekaya Jewelry for FREE (or near-zero cost)**
>
> This guide reflects the **actual project state** as of April 2026. Completed steps are marked ✅. Pending steps are marked ❌.

---

## 📋 Table of Contents

1. [Before You Start — What You Need](#-step-0-before-you-start--what-you-need)
2. [Create Free Accounts](#-step-1-create-free-accounts-cost-0)
3. [Install Developer Tools](#-step-2-install-developer-tools-on-your-computer-cost-0)
4. [Create the Project](#-step-3-create-the-nextjs-project-cost-0) ✅
5. [Set Up Supabase Database](#-step-4-set-up-supabase-database-cost-0) ❌
6. [Build the Design System](#-step-5-build-the-design-system--css-cost-0) ✅
7. [Build Layout Components](#-step-6-build-layout-components-header-footer-menu) ✅
8. [Build the Homepage](#-step-7-build-the-homepage) ✅
9. [Build Product Pages](#-step-8-build-product-pages) ✅
10. [Build the Cart System](#-step-9-build-the-cart-system) ✅
11. [Build Authentication](#-step-10-build-authentication-login--register) ✅ UI done / ❌ Backend pending
12. [Build User Account Pages](#-step-11-build-user-account-pages) ⚠️ Shell only
13. [Build the QR Memory System](#-step-12-build-the-qr-memory-system--the-unique-feature) ⚠️ Shell only
14. [Build Checkout & Payment](#-step-13-build-checkout--payment) ✅ UI done / ❌ API pending
15. [Build Admin Dashboard](#-step-14-build-admin-dashboard) ❌
16. [Build Static Info Pages](#-step-15-build-static-info-pages) ✅
17. [Polish & Animations](#-step-16-polish--animations) ✅
18. [SEO & Performance](#-step-17-seo--performance-optimization) ❌
19. [Testing](#-step-18-testing-everything) ❌
20. [Deploy to Vercel (FREE)](#-step-19-deploy-to-vercel-free) ❌
21. [Buy & Connect Domain](#-step-20-buy--connect-your-domain-12year) ❌
22. [Set Up Payments (Go Live)](#-step-21-set-up-live-payments) ❌
23. [Launch Day Checklist](#-step-22-launch-day-checklist-) ❌
24. [Post-Launch](#-step-23-post-launch--monitoring--growth) ❌
25. [Total Cost Summary](#-total-cost-summary)
26. [Troubleshooting](#-troubleshooting-common-problems--fixes)

---

## 🟢 Step 0: Before You Start — What You Need

### Skills (Don't worry — you'll learn along the way)

| Skill        | Level Needed | Where to Learn (Free)                                        |
| ------------ | ------------ | ------------------------------------------------------------ |
| HTML & CSS   | Basic        | [freeCodeCamp.org](https://freecodecamp.org)                 |
| JavaScript   | Basic        | [javascript.info](https://javascript.info)                   |
| React basics | Beginner     | [react.dev/learn](https://react.dev/learn)                   |
| Git basics   | Very basic   | [learngitbranching.js.org](https://learngitbranching.js.org) |

### Hardware

- Any computer (Windows, Mac, or Linux) — even a budget laptop works
- Stable internet connection

### Time Estimate

| Work Schedule             | Total Time |
| ------------------------- | ---------- |
| 2-4 hours/day (part-time) | ~8 weeks   |
| 6-8 hours/day (full-time) | ~4 weeks   |

---

## 🟢 Step 1: Create Free Accounts (Cost: $0)

Create accounts on these platforms. **All are free.** Do this first — you'll need them throughout.

### 1.1 GitHub (Code Storage)

1. Go to [github.com](https://github.com)
2. Click **"Sign up"**
3. Use your email → Create username → Create password
4. Choose the **Free plan**
5. ✅ Done — Your code lives here

### 1.2 Supabase (Database + Auth + Storage)

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with your **GitHub account** (easiest)
4. You'll create a project in Step 4 — just make the account now
5. ✅ Done — Free tier includes: 500MB database, 50K auth users (images stored on Supabase Storage)

### 1.3 Vercel (Hosting & Deployment)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign in with your **GitHub account**
4. Choose the **Hobby (Free) plan**
5. ✅ Done — Free tier includes: 100GB bandwidth, SSL, CDN, auto-deploy

### 1.4 Stripe (Apple Pay & Mastercard)

1. Go to [stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Fill in your business details
4. You'll get **test keys immediately** (live keys after verification)
5. ✅ Done — No monthly fee, you only pay 2.9% + 1 AED per transaction
6. Supports: Mastercard, Apple Pay

### 1.5 PayPal (PayPal Checkout)

1. Go to [paypal.com](https://paypal.com)
2. Create a **Business account** and verify your details
3. Go to the Developer Dashboard to get your **Client ID** and **Secret**
4. ✅ Done — ~3.9% + fixed fee per transaction
5. Supports: PayPal accounts

> **💡 Why Stripe + PayPal?** You explicitly requested supporting Apple Pay, Mastercard, and PayPal. Stripe perfectly handles Apple Pay and Mastercard securely, while PayPal handles PayPal balances.

### 1.6 Google (Analytics & Search Console)

1. Go to [analytics.google.com](https://analytics.google.com) → Create account
2. Go to [search.google.com/search-console](https://search.google.com/search-console) → Create account
3. ✅ Done — Both are completely free

> **💡 Tip:** Use the same email for all accounts. It's easier to manage.

---

## 🟢 Step 2: Install Developer Tools on Your Computer (Cost: $0)

### 2.1 Install Node.js (Required — Runs JavaScript)

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (the one with the green button)
3. Run the installer → Click "Next" through everything
4. Verify it works — open **Command Prompt** (Windows) or **Terminal** (Mac) and type:
   ```bash
   node --version
   npm --version
   ```

### 2.2 Install Git (Required — Version Control)

1. Go to [git-scm.com](https://git-scm.com)
2. Download and install
3. Verify:
   ```bash
   git --version
   ```

### 2.3 Install VS Code (Recommended — Code Editor)

1. Go to [code.visualstudio.com](https://code.visualstudio.com)
2. Download and install
3. Install these **free extensions**:
   - **Arabic Keyboard** — For typing Arabic content
   - **ES7+ React/Redux/React-Native snippets** — Code shortcuts
   - **Auto Rename Tag** — Automatically renames paired HTML tags
   - **Prettier** — Auto-formats your code
   - **Error Lens** — Shows errors inline

### 2.4 Install a Browser (for testing)

- **Google Chrome** (recommended) — has the best developer tools
- Install the **React Developer Tools** Chrome extension (free)

---

## ✅ Step 3: Create the Next.js Project (DONE)

> This step is already complete. The project lives at `Hekaya_Jewerly/hekaya/`.

### What was created

```bash
npx create-next-app@latest hekaya
# Choices: TypeScript ✅ | ESLint ✅ | Tailwind CSS ✅ | src/ dir ✅ | App Router ✅
```

**Actual versions installed:**

- Next.js **16.2.4** (Turbopack enabled)
- React **19.2.4**
- TypeScript **5**
- Tailwind CSS **v4** (CSS-only config — NO `tailwind.config.ts`)
- next-intl **4.x**

> ⚠️ **Important:** The build guide originally mentioned Next.js 15 and shadcn/ui. The actual project uses **Next.js 16.2.4** with **custom-built UI components** (no shadcn/ui). Tailwind v4 does not use a JS config file.

### All packages installed

```bash
# Inside hekaya/ folder:
npm install next-intl @supabase/supabase-js @supabase/ssr \
  @stripe/stripe-js stripe @paypal/react-paypal-js @aws-sdk/client-s3 \
  @tanstack/react-query react-hook-form zod @hookform/resolvers \
  zustand framer-motion embla-carousel-react lucide-react \
  sonner resend qrcode sharp nanoid date-fns clsx tailwind-merge

npm install -D vitest @testing-library/react @types/qrcode @types/sharp
```

### Actual folder structure created

```
hekaya/
├── messages/
│   ├── ar.json              ✅ Full Arabic translations
│   └── en.json              ✅ Full English translations
├── src/
│   ├── app/
│   │   ├── [locale]/        ✅ Bilingual routing
│   │   ├── layout.tsx       ✅ Root layout
│   │   ├── page.tsx         ✅ Root → redirect('/ar')
│   │   └── globals.css      ✅ Tailwind v4 @theme design system
│   ├── components/          ✅ All UI + layout + home + product + cart
│   ├── data/products.ts     ✅ 6 placeholder products
│   ├── i18n/routing.ts      ✅ next-intl locale config
│   ├── i18n/request.ts      ✅ next-intl server config
│   ├── lib/
│   │   ├── supabase/        ✅ client.ts, server.ts, admin.ts
│   │   ├── format.ts        ✅
│   │   └── utils.ts         ✅ cn()
│   ├── proxy.ts             ✅ next-intl middleware (Next.js 16 naming)
│   ├── stores/cart.store.ts ✅
│   └── types/index.ts       ✅
├── .env.local               ✅ Placeholder keys
└── next.config.ts           ✅
```

> ⚠️ **Key difference from original plan:** The middleware file is named `proxy.ts` (not `middleware.ts`) and exports a named `proxy` function. This is required for Next.js 16 compatibility.

### How to run the dev server

```bash
# ⚠️ ALWAYS cd into the hekaya/ subfolder first
cd C:\Users\Dell\Desktop\Hekaya_Jewerly\hekaya
npm run dev
# Opens at http://localhost:3000 → auto-redirects to /ar
```

---

## ❌ Step 4: Set Up Supabase Database (PENDING)

### 4.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project named `hekaya`
3. Copy your API keys and paste into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### 4.2 Run the Database Schema

Go to Supabase → SQL Editor → paste and run all `CREATE TABLE` statements from `docs/02_TECH_ARCHITECTURE.md`.

Tables to create: `profiles`, `categories`, `products`, `product_variations`, `orders`, `order_items`, `qr_memories`, `memory_photos`, `wishlist`, `addresses`

### 4.3 Enable Row Level Security (RLS)

Run the RLS policies from `docs/05_SECURITY_AUTH.md` to secure all tables.

### 4.4 Set Up Supabase Storage (Image Storage)

In Supabase Dashboard → Storage:

1. Create bucket: `hekaya-images` (make it public)
2. Inside the bucket, use these prefixes:
   - `products/` — product images
   - `memories/` — memory photos (max 3 per QR)
   - `qr-codes/` — generated QR code images

### 4.5 Seed Initial Data (Optional)

After creating tables, insert some test products to replace `src/data/products.ts` placeholder data.

---

## ✅ Step 5: Build the Design System / CSS (DONE)

### What was built

All design tokens are defined in `src/app/globals.css` using Tailwind v4's `@theme` block:

```css
@theme inline {
  --color-primary: #c9a96e; /* Warm Gold */
  --color-primary-dark: #b8944d;
  --color-bg-primary: #fafaf8; /* Warm White */
  --color-bg-secondary: #f2f0eb;
  --color-text-primary: #1a1a1a; /* Charcoal */
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-border: #eae6e0;
  /* ... plus fonts, shadows, radius */
}
```

Custom utility classes built: `.container-hekaya`, `.btn-gold`, `.btn-outline-gold`, `.badge-qr`, `.badge-new`, `.badge-sale`, `.badge-soldout`, `.divider-gold`, `.section-padding`, `.product-card`

> ⚠️ **Tailwind v4 note:** Do NOT use `z-[--css-var]` syntax — it generates invalid CSS. Always use hardcoded z-index values: `z-50` (header), `z-[41]` (drawer panel), `z-40` (overlay), `z-30` (floats).

### Fonts (loaded via Google Fonts in `[locale]/layout.tsx`)

| Font               | Variable             | Language         |
| ------------------ | -------------------- | ---------------- |
| Cormorant Garamond | `--font-cormorant`   | English headings |
| Inter              | `--font-inter`       | English body     |
| Amiri              | `--font-amiri`       | Arabic headings  |
| Noto Sans Arabic   | `--font-noto-arabic` | Arabic body      |

---

## ✅ Step 6: Build Layout Components (DONE)

### What was built

| Component          | File                                     | Notes                                                       |
| ------------------ | ---------------------------------------- | ----------------------------------------------------------- |
| `Header`           | `components/layout/Header.tsx`           | Fixed, z-50, frosted glass on scroll, bilingual, cart badge |
| `Footer`           | `components/layout/Footer.tsx`           | Charcoal bg, 3-col, social icons, payment logos             |
| `MobileMenu`       | `components/layout/MobileMenu.tsx`       | Framer-motion slide drawer, direction-aware (RTL/LTR)       |
| `LanguageSwitcher` | `components/layout/LanguageSwitcher.tsx` | Pill toggle ع / EN                                          |
| `CartDrawer`       | `components/cart/CartDrawer.tsx`         | Slide from right, qty stepper, remove, subtotal             |

### Z-index stack

```
z-50  → Header (always on top)
z-41  → CartDrawer / MobileMenu panel
z-40  → Overlay (backdrop)
z-30  → WhatsApp float, BackToTop float
```

---

## ✅ Step 7: Build the Homepage (DONE)

### 6 sections built

| #   | Component            | File                                                  |
| --- | -------------------- | ----------------------------------------------------- |
| 1   | `HeroSection`        | Full-screen image, dark overlay, dual CTA buttons     |
| 2   | `TrustBadges`        | 4 trust icons (Truck, Shield, Award, RefreshCw)       |
| 3   | `CollectionShowcase` | 4 collection cards linking to `/products?collection=` |
| 4   | `BrandStoryStrip`    | Charcoal bg, brand quote, 3 value pills               |
| 5   | `QRMemoryBanner`     | Dark gradient, QR icon, 3 numbered steps              |
| 6   | `TestimonialCards`   | 3 bilingual review cards with StarRating              |

Floating elements: `WhatsAppFloat`, `BackToTop`

---

## ✅ Step 8: Build Product Pages (DONE)

### What was built

| File                                    | Description                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `components/products/ProductCard.tsx`   | Grid card: image, badges (new/sale/qr/soldout), name, price, rating. Hover quick-add on desktop |
| `components/products/ProductGrid.tsx`   | Responsive grid, configurable columns (2/3/4), empty state                                      |
| `components/products/ProductDetail.tsx` | Image gallery, thumbnail switcher, qty stepper, Add to Cart, QR Memory callout                  |
| `app/[locale]/products/page.tsx`        | Server component, filters by `?collection=`, renders product count                              |
| `app/[locale]/product/[slug]/page.tsx`  | Server component, `generateStaticParams`, `generateMetadata`, related products                  |

### Placeholder data

`src/data/products.ts` contains 6 products until Supabase is connected:

- Gold Birthstone Necklace (299 AED, QR, new)
- First Steps Bracelet (199 AED, sale, QR)
- Custom Name Necklace (349 AED, new)
- Memories Gift Set (599 AED, sale, QR)
- Little Rose Ring (179 AED)
- Gold Star Earrings (149 AED, sold out)

---

## ✅ Step 9: Build the Cart System (DONE)

### Zustand cart store (`src/stores/cart.store.ts`)

```typescript
// Cart item shape
CartItem = { product: Product; quantity: number }

// Actions available
addItem(product, qty?)
removeItem(productId)
updateQuantity(productId, qty)
clearCart()
openCart() / closeCart() / toggleCart()

// Computed
getTotalItems()    // for badge
getTotalPrice()    // for subtotal
```

Cart is persisted to localStorage under key `hekaya-cart`.

---

## ✅ Step 10: Build Authentication — UI Done / ❌ Backend Pending

### Pages built

| Page            | File                                    | Status         |
| --------------- | --------------------------------------- | -------------- |
| Login           | `app/[locale]/login/page.tsx`           | ✅ UI complete |
| Register        | `app/[locale]/register/page.tsx`        | ✅ UI complete |
| Forgot Password | `app/[locale]/forgot-password/page.tsx` | ✅ UI complete |

All forms have: bilingual labels, show/hide password, loading spinner, success/error states.

### Backend (Supabase) — TO DO

Replace the `TODO` comments in each form:

```typescript
// login/page.tsx
const { error } = await supabase.auth.signInWithPassword({ email, password });

// register/page.tsx
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: name } },
});

// forgot-password/page.tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
});
```

---

## ⚠️ Step 11: Build User Account Pages (SHELL ONLY)

### What exists

`app/[locale]/account/page.tsx` — Shows login prompt if unauthenticated, or a menu with Orders/Wishlist links when logged in.

### Still to build

- `account/orders/page.tsx` — Order history list
- `account/wishlist/page.tsx` — Saved items
- `account/addresses/page.tsx` — Address book
- `account/settings/page.tsx` — Profile edit

Each requires Supabase auth session check (Step 4 + Step 10 backend must be done first).

---

## ⚠️ Step 12: Build the QR Memory System (SHELL ONLY)

### What exists

`app/[locale]/memory/[slug]/page.tsx` — PIN-protected memory viewer page. Shows title, message, and up to 3 photos after PIN entry. Uses placeholder data until Supabase is connected.

### Still to build

**1. `src/lib/qr.ts`** — QR code generation utility:

```typescript
import QRCode from "qrcode";
import { customAlphabet } from "nanoid";

const generateSlug = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 8);

export async function generateQRCode(slug: string): Promise<Buffer> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/memory/${slug}`;
  return QRCode.toBuffer(url, {
    width: 1000,
    color: { dark: "#C9A96E", light: "#FAFAF8" },
    errorCorrectionLevel: "H",
  });
}
```

**2. API route: `app/api/qr/route.ts`** — Called after payment to generate + store QR

**3. Memory pages:**

- `app/[locale]/my-memories/page.tsx` — User's list of all their memories
- `app/[locale]/my-memories/[id]/edit/page.tsx` — Upload photos, write milestones

**4. Flow after payment:**

1. Order confirmed → check `has_qr_memory = true` on products
2. Generate unique 8-char slug via nanoid
3. Generate gold QR code image → upload to Supabase Storage `qr-codes` bucket
4. Insert record into `qr_memories` table
5. Show QR on order confirmation page
6. Email QR to customer via Resend

---

## ✅ Step 13: Build Checkout — UI Done / ❌ API Pending

### What exists

`app/[locale]/checkout/page.tsx` — 3-step checkout stepper:

1. **Shipping** — Name, phone, address, city, emirate (dropdown)
2. **Review** — Order summary with items, shipping address confirmation
3. **Payment** — Payment method selector (placeholder buttons)

Order summary sidebar shows subtotal, shipping cost (free over 200 AED), and total.

### Still to build

**`app/api/checkout/stripe/route.ts` & `app/api/checkout/paypal/route.ts`** — Server-side order creation:

```typescript
// Validate cart items (never trust client-side prices)
// Calculate total on the server
// Create Stripe PaymentIntent or PayPal Order
// Create order record in Supabase
// Return clientSecret or orderID to frontend
```

**`app/api/webhook/route.ts`** — Stripe webhook handler:

```typescript
// Verify Stripe signature
// On payment_intent.succeeded: update order status, trigger QR generation
// On payment_intent.failed: mark order failed
```

**`src/lib/stripe.ts`** — Stripe server client:

```typescript
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});
```

---

## ❌ Step 14: Build Admin Dashboard (PENDING)

### To build at `/admin` (separate from bilingual routing)

- `app/admin/layout.tsx` — Admin shell with sidebar, auth guard (role = 'admin')
- `app/admin/page.tsx` — Dashboard overview (orders today, revenue, stock alerts)
- `app/admin/products/page.tsx` — Products list + add/edit/delete
- `app/admin/orders/page.tsx` — Orders list with status management
- `app/admin/categories/page.tsx` — Category management
- `app/admin/coupons/page.tsx` — Discount coupon management
- `app/admin/memories/page.tsx` — View all QR memory pages

Auth guard:

```typescript
// In admin/layout.tsx
const {
  data: { user },
} = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();
if (profile?.role !== "admin") redirect("/");
```

---

## ✅ Step 15: Build Static Info Pages (DONE)

| Page     | Route       | Notes                                              |
| -------- | ----------- | -------------------------------------------------- |
| About    | `/about`    | Hero image, brand story, values grid, QR explainer |
| Contact  | `/contact`  | Contact info + WhatsApp CTA + contact form         |
| Policies | `/policies` | Tabbed: Shipping / Returns / Privacy / Terms       |

> **Note:** The original plan had separate pages for `/shipping`, `/returns`, `/terms`, `/privacy`. These were consolidated into a single tabbed `/policies` page to keep the site simple and avoid too many pages.

---

## ✅ Step 16: Polish & Animations (DONE)

### Animation strategy

- **Only `framer-motion` `whileInView`** with fade + Y16 (0.5s) for section entrances
- **CSS `transition-all duration-200`** for hover/focus states
- No loading skeletons yet — TODO for production

### Header behavior

- Transparent border on load → `bg-white/95 backdrop-blur-md` + shadow on scroll
- Always `z-50` (hardcoded — Tailwind v4 CSS variable z-index does not work)

---

## ❌ Step 17: SEO & Performance Optimization (PENDING)

### To do

- Add `generateMetadata()` to all remaining pages (login, register, about, contact, policies)
- Add `robots.txt` and `sitemap.xml`
- Add Open Graph images for social sharing
- Optimize all product images via `next/image` (already configured, but real images needed)
- Add structured data (JSON-LD) for products

---

## ❌ Step 18: Testing Everything (PENDING)

### Critical flows to test

- [ ] Add to cart → View cart → Update qty → Remove item
- [ ] AR/EN language switch on all pages
- [ ] RTL layout correctness on mobile
- [ ] Login / Register / Password reset forms
- [ ] Checkout 3 steps (shipping → review → payment)
- [ ] QR Memory page loads correctly
- [ ] All images load (no 404s)
- [ ] No hydration mismatch errors (disable browser extensions when testing)

---

## ❌ Step 19: Deploy to Vercel (PENDING)

1. Push code to GitHub:
   ```bash
   cd C:\Users\Dell\Desktop\Hekaya_Jewerly\hekaya
   git add .
   git commit -m "Production-ready build"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) → Import GitHub repo
3. Set **Root Directory** to `hekaya` (since `package.json` is inside the subfolder)
4. Add all environment variables from `.env.local`
5. Deploy!

---

## ❌ Step 20: Buy & Connect Your Domain (~$12/year)

1. Buy `hekaya-jewelry.com` via [Namecheap](https://namecheap.com) or directly through Vercel
2. In Vercel → Project Settings → Domains → Add `hekaya-jewelry.com`
3. Update DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to `https://hekaya-jewelry.com`

---

## ❌ Step 21: Set Up Live Payments

1. Go to Stripe Dashboard → Activate account with UAE business documents
2. Go to PayPal Dashboard → Get live Client ID and Secret
3. Switch to **live keys** in Vercel environment variables for both Stripe and PayPal
4. Configure webhook in Stripe Dashboard → `https://hekaya-jewelry.com/api/webhook`
5. Test with a real transaction

---

## ❌ Step 22: Launch Day Checklist 🚀

- [ ] Stripe & PayPal live keys set in Vercel
- [ ] Supabase RLS enabled on all tables
- [ ] Domain connected + SSL active
- [ ] All `.env` vars set in Vercel
- [ ] Test full purchase flow end-to-end
- [ ] Test QR code generation
- [ ] Test bilingual switch on mobile
- [ ] Remove all test/placeholder data
- [ ] Seed real products in Supabase

---

## ❌ Step 23: Post-Launch — Monitoring & Growth

- **Vercel Analytics** — free, already included
- **Google Analytics** — add the tracking script to `[locale]/layout.tsx`
- **Sentry** — error monitoring (`@sentry/nextjs` already in devDependencies)
- **Supabase Dashboard** — monitor DB usage and active users

---

## 💰 Total Cost Summary

**First Year Total: ~$12 (domain only!) + payment processing fees.**
Monthly recurring: $0 until you hit massive scale.

| Service                      | Cost                          |
| ---------------------------- | ----------------------------- |
| Vercel Hobby                 | Free                          |
| Supabase Free Tier           | Free                          |
| GitHub                       | Free                          |
| Domain (~hekaya-jewelry.com) | ~$12/year                     |
| Stripe (Apple Pay/Mastercard) | 2.9% + 1 AED per transaction  |
| PayPal                       | ~3.9% + fixed per transaction |

---

## 🔧 Troubleshooting Common Problems & Fixes

| Problem                                         | Cause                                                     | Fix                                                |
| ----------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `npm error ENOENT package.json`                 | Running `npm run dev` from workspace root                 | `cd hekaya` first, then `npm run dev`              |
| Header hidden behind images on scroll           | Tailwind v4 `z-[--css-var]` generates invalid CSS         | Use hardcoded `z-50` on the header                 |
| Hydration mismatch with `bbai-tooltip-injected` | Browser extension (AI tool) modifying the DOM             | Test in incognito mode with extensions disabled    |
| `z-[--z-header]` not working                    | Tailwind v4 does not support CSS var in arbitrary z-index | Replace with `z-50`, `z-40`, `z-30` etc.           |
| `Instagram` not in lucide-react                 | Icon was removed in newer lucide versions                 | Use inline SVG or find the correct icon name       |
| Image 404 from Unsplash                         | Unsplash photo was deleted                                | Replace URL with a working Unsplash photo ID       |
| `middleware.ts` export error in Next.js 16      | Next.js 16 changed middleware conventions                 | File is `proxy.ts`, exports named `proxy` function |

---

Built with love for Hekaya Jewelry
**hekaya-jewelry.com**
