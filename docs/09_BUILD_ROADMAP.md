# 🗺️ Build Roadmap

> 8-week step-by-step plan to build Hekaya Jewelry from zero to launch

---

## Overview

This roadmap assumes you're working **part-time** (2-4 hours/day). If working full-time, you can compress this to 4-5 weeks. Each week has clear deliverables and a checklist.

```
Week 1-2:  Foundation (Setup, Design System, & Bilingual AR/EN)
Week 3-4:  Core Pages (Homepage + Products + Cart)
Week 5:    Auth + User Features
Week 6:    QR Memory System (Unique Feature)
Week 7:    Payment + Checkout + Admin
Week 8:    Polish + Testing + Launch
```

---

## 📅 Week 1: Project Setup & Foundation

### Goal: Project running locally with design system applied and Bilingual setup

**Day 1-2: Environment Setup**
- [ ] Create GitHub repository `hekaya`
- [ ] Initialize Next.js 16 project (`npx create-next-app@latest`)
- [ ] Install all dependencies including `next-intl` (see [02_TECH_ARCHITECTURE.md](02_TECH_ARCHITECTURE.md))
- [ ] Create project folder structure (see README)
- [ ] Set up `.env.local` with Supabase keys
- [ ] Confirm `npm run dev` works at localhost:3000

**Day 3-4: Supabase & Bilingual Setup**
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run all CREATE TABLE SQL (see [02_TECH_ARCHITECTURE.md](02_TECH_ARCHITECTURE.md))
- [ ] Enable Row Level Security on all tables
- [ ] Create RLS policies (see [05_SECURITY_AUTH.md](05_SECURITY_AUTH.md))
- [ ] Set up Supabase Auth (enable email + phone)
- [ ] Configure `next-intl` for Arabic (AR) and English (EN) routing and translations

**Day 5-7: Design System**
- [ ] Create `globals.css` with all CSS variables (see [01_BRAND_DESIGN.md](01_BRAND_DESIGN.md))
- [ ] Set up fonts (Amiri, Noto Sans Arabic, Cormorant Garamond, Inter)
- [ ] Configure RTL layout in `layout.tsx` for Arabic
- [ ] Build base UI components: Button, Badge, Input, Modal (Quiet Luxury style)

### ✅ Week 1 Deliverable
A running Next.js app with AR/EN routing, RTL layout, CSS variables, base components, and connected Supabase.

---

## 📅 Week 2: Layout & Navigation

### Goal: Full site shell — Header, Footer, Navigation working

**Day 1-3: Header & Navigation**
- [ ] Build `Header` component (clean logo, search, cart icon, user menu)
- [ ] Build `LanguageSwitcher` (AR/EN toggle)
- [ ] Build `MobileMenu` (drawer navigation for phones)
- [ ] Build `CategoryNav` (horizontal scrollable category pills)
- [ ] Build `SearchOverlay` (fullscreen search with suggestions)
- [ ] Implement cart item count badge

**Day 4-5: Footer & Shared Layout**
- [ ] Build `Footer` component (clean links, social icons, payment logos)
- [ ] Build `Container` wrapper component
- [ ] Build `Breadcrumb` component
- [ ] Create shared layout for all pages
- [ ] Add WhatsApp floating button

**Day 6-7: Static Pages**
- [ ] Build About page (`/about`)
- [ ] Build Contact page (`/contact`)
- [ ] Build FAQ page (`/faq`) with accordion
- [ ] Build Privacy & Terms pages
- [ ] Test all navigation links

### ✅ Week 2 Deliverable
Complete site shell — click through Header, Footer, and all static pages. Mobile responsive and bilingual.

---

## 📅 Week 3: Homepage & Product Display

### Goal: Beautiful homepage + product listing + product detail pages

**Day 1-3: Homepage Sections (Simplified)**
- [ ] Build `HeroSection` (single powerful image, not an overwhelming slider)
- [ ] Build `BrandStoryStrip` (typography focused: Vision & Tagline)
- [ ] Build `CollectionShowcase` (elegant 3-4 collection cards)
- [ ] Build `QRMemoryBanner` (explain the memory code feature elegantly)
- [ ] Build `TestimonialCards` (3 minimal cards)
- [ ] Build `TrustBadges` (free shipping, secure payment, etc.)

**Day 4-5: Product Listing Page**
- [ ] Build `ProductCard` component (minimalist: image, name, price, badge)
- [ ] Build `ProductGrid` (generous spacing, 4 columns desktop)
- [ ] Build `FilterSidebar` (category, price range, material)
- [ ] Build `SortDropdown` (newest, price low-high, popular)
- [ ] Implement category filtering `/category/[slug]`
- [ ] Build `Pagination` component

**Day 6-7: Product Detail Page**
- [ ] Build `ProductGallery` (main image + thumbnails, zoom)
- [ ] Build product info section (name, price, description)
- [ ] Build size/variant selector (if applicable)
- [ ] Build "Add to Cart" button with quantity selector
- [ ] Build `RelatedProducts` section
- [ ] Build QR Memory badge (shows if product includes QR)

### ✅ Week 3 Deliverable
Full simplified homepage, browse products by category, view product details.

---

## 📅 Week 4: Cart & Wishlist

### Goal: Full shopping cart functionality + wishlist

**Day 1-3: Cart System**
- [ ] Set up Zustand store for cart state
- [ ] Build `CartDrawer` (slide-in from left for RTL)
- [ ] Build `CartItem` component (image, name, qty, price, remove)
- [ ] Implement add to cart with toast notification
- [ ] Implement quantity update (+/−)
- [ ] Implement remove item
- [ ] Cart persists in localStorage
- [ ] Build `CartPage` full page view

**Day 4-5: Cart Features**
- [ ] Calculate subtotal, shipping, total
- [ ] Shipping cost based on emirate (customer pays actual cost)
- [ ] Empty cart state with "Continue Shopping" CTA

**Day 6-7: Wishlist**
- [ ] Build `WishlistButton` (heart icon toggle)
- [ ] Build `WishlistPage` (`/account/wishlist`)
- [ ] Save wishlist to Supabase (logged in) or localStorage (guest)
- [ ] "Move to Cart" functionality

### ✅ Week 4 Deliverable
Add products to cart, adjust quantities, save wishlist. Cart drawer works on mobile.

---

## 📅 Week 5: Authentication & User Account

### Goal: Users can register, login, and manage their profile

**Day 1-3: Authentication**
- [ ] Build `LoginPage` (`/login`)
- [ ] Build `RegisterPage` (`/register`)
- [ ] Implement email + password auth via Supabase
- [ ] Implement phone OTP login
- [ ] Build `ForgotPassword` page
- [ ] Auth state management with Zustand
- [ ] Protected route middleware (redirect to login)

**Day 4-5: User Account Pages**
- [ ] Build `AccountLayout` (sidebar nav + content area)
- [ ] Build `ProfilePage` (`/account/profile`) — edit name, phone, address
- [ ] Build `OrdersPage` (`/account/orders`) — list of past orders
- [ ] Build `OrderDetailPage` (`/account/orders/[id]`) — order items, status, tracking
- [ ] Build `AddressBook` — save multiple shipping addresses

**Day 6-7: Account Features**
- [ ] Build `MemoriesPage` (`/account/memories`) — list of QR memories
- [ ] Build `ChangePassword` functionality
- [ ] Implement `Logout` with session cleanup
- [ ] Avatar upload
- [ ] Test full auth flow: register → login → profile → logout

### ✅ Week 5 Deliverable
Full auth system. Users register, login, manage profile, view orders, and access their QR memories.

---

## 📅 Week 6: QR Memory System ⭐

### Goal: The unique feature — QR codes with digital memory pages

> This is the feature that differentiates Hekaya Jewelry. See [04_QR_MEMORY_SYSTEM.md](04_QR_MEMORY_SYSTEM.md) for full spec.

**Day 1-2: QR Generation**
- [ ] Build QR generation function using `qrcode` npm package
- [ ] Generate unique slug for each memory page (`/memory/abc123`)
- [ ] Store QR code image in Supabase Storage
- [ ] Link QR to order item after purchase

**Day 3-4: Memory Page (Public View)**
- [ ] Build `MemoryPage` (`/memory/[slug]`) — the public QR destination
- [ ] Display child's name, photo, message
- [ ] Display timeline of photos and milestones
- [ ] Beautiful, animated, swipeable gallery
- [ ] Optional PIN protection (prompt for PIN before showing content)
- [ ] "This memory powered by Hekaya Jewelry" subtle branding

**Day 5-7: Memory Editor (Owner Only)**
- [ ] Build `MemoryEditor` (`/account/memories/[slug]/edit`)
- [ ] Edit child name, birth date, message
- [ ] Upload child's main photo
- [ ] Upload photos (max 3 images)
- [ ] Add title and message
- [ ] Reorder and delete photos
- [ ] Set/change 4-digit PIN code
- [ ] Preview mode (see what PIN viewers see)

### ✅ Week 6 Deliverable
When a kids' product is purchased, a QR code is generated. Scanning it opens a beautiful memory page. The owner can edit it with photos and milestones.

---

## 📅 Week 7: Payment & Admin

### Goal: Accept real payments + manage store from admin dashboard

**Day 1-3: Checkout & Payment**
- [ ] Build `CheckoutPage` (`/checkout`) — 3-step form
- [ ] Step 1: Shipping information form
- [ ] Step 2: Order review summary
- [ ] Step 3: Stripe / PayPal payment form integration
- [ ] Server-side order creation and total calculation
- [ ] Implement Stripe + PayPal API routes (`/api/checkout/stripe` & `paypal`)
- [ ] Build `OrderConfirmation` page (success/failure)
- [ ] QR code auto-generated if customer selected QR option

**Day 4-5: Admin Dashboard**
- [ ] Build `AdminLayout` (sidebar: Dashboard, Products, Orders, Categories)
- [ ] Build `AdminDashboard` (today's stats: orders, revenue, new users)
- [ ] Build `AdminProducts` (CRUD: list, add, edit, delete products)
- [ ] Build product image upload (multiple images per product)
- [ ] Build `AdminCategories` (CRUD: list, add, edit, delete)

**Day 6-7: Admin Orders**
- [ ] Build `AdminOrders` (list orders, filter by status)
- [ ] Build `AdminOrderDetail` (view items, update status, add tracking)
- [ ] Admin route protection (only `role = 'admin'` or `role = 'manager'`)
- [ ] Seed initial products and categories for testing

### ✅ Week 7 Deliverable
Complete checkout flow with real payments (Stripe + PayPal). Admin can manage products and orders.

---

## 📅 Week 8: Polish, Test & Launch 🚀

### Goal: Bug-free, fast, beautiful — LIVE on the internet

**Day 1-2: Visual Polish**
- [ ] Review every page for design consistency (Quiet Luxury vibe)
- [ ] Add loading states (skeletons) for all data-fetching pages
- [ ] Add empty states (no products, no orders, etc.)
- [ ] Add micro-animations (hover effects, page transitions)
- [ ] Build custom `404` page
- [ ] Build custom `500` error page
- [ ] Final RTL/LTR check — Arabic and English toggle correctly

**Day 3-4: Testing**
- [ ] Test full flow: browse → cart → checkout → payment (test mode)
- [ ] Test auth flow: register → login → profile → orders
- [ ] Test QR flow: purchase → QR generated → scan → view → edit
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test on desktop (Chrome, Firefox, Edge)
- [ ] Test slow connection (Chrome DevTools → throttle to 3G)
- [ ] Check all links work (no 404s)

**Day 5-6: SEO & Performance**
- [ ] Add `<title>` and `<meta description>` on every page
- [ ] Add Open Graph meta tags (for social sharing)
- [ ] Create `sitemap.xml` (Next.js can auto-generate)
- [ ] Create `robots.txt`
- [ ] Run Lighthouse audit → aim for 90+ score
- [ ] Optimize images (compress, WebP, correct sizes)
- [ ] Test Core Web Vitals

**Day 7: LAUNCH! 🎉**
- [ ] Switch Stripe + PayPal from test/sandbox to live keys
- [ ] Deploy to Vercel production (see [07_DEPLOYMENT.md](07_DEPLOYMENT.md))
- [ ] Connect custom domain (`hekaya-jewelry.com`)
- [ ] Verify SSL is active (https)
- [ ] Set up UptimeRobot monitoring
- [ ] Submit sitemap to Google Search Console
- [ ] Make one real test purchase
- [ ] Post launch announcement on social media!

### ✅ Week 8 Deliverable
Hekaya Jewelry is LIVE at `hekaya-jewelry.com`! 🎉

---

## 📈 Post-Launch Roadmap

### Month 2-3: Growth Features
- [ ] Instagram Shopping integration
- [ ] Email marketing (welcome, abandoned cart, order shipped)
- [ ] SMS notifications via Twilio
- [ ] Product reviews & ratings
- [ ] Search with Algolia (if needed)

### Month 4-6: Advanced Features
- [ ] Tabby / Tamara BNPL integration
- [ ] Gift wrapping option at checkout
- [ ] Gift cards system
- [ ] Loyalty points / rewards
- [ ] Inventory alerts (low stock notifications)
- [ ] Advanced admin analytics

### Month 6-12: Scale
- [ ] Native mobile app (React Native)
- [ ] Multiple admin users with role-based access
- [ ] Warehouse/fulfillment integration
- [ ] A/B testing for homepage layouts
- [ ] Automated marketing funnels
- [ ] Expansion to GCC markets

---

## 🎯 Key Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|-----------------|
| **Environment Ready** | End of Week 1 | Next.js running, Supabase connected, Bilingual |
| **Site Shell** | End of Week 2 | Navigate all pages, mobile responsive |
| **Products Live** | End of Week 3 | Browse, search, filter, view products |
| **Cart Works** | End of Week 4 | Add to cart, coupons, total calculation |
| **Users Can Login** | End of Week 5 | Auth, profile, order history |
| **QR Feature Done** | End of Week 6 | Generate, view, edit memory pages |
| **Payments Work** | End of Week 7 | End-to-end purchase in test mode |
| **🚀 LAUNCH** | End of Week 8 | Live site accepting real orders |
