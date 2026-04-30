# 📄 Pages & Components

> Every page and reusable UI component mapped out for Hekaya Jewellery

---

## 1. Complete Page Map (Bilingual AR/EN)

```
hekaya-Jewellery.com/
├── /[locale]/                  Homepage (e.g. /ar/ or /en/)
├── /[locale]/products          Shop All
├── /[locale]/category/[slug]   Category page
├── /[locale]/product/[slug]    Product detail
├── /[locale]/login             Login
├── /[locale]/register          Registration
├── /[locale]/forgot-password   Password reset
├── /[locale]/account           User dashboard
├── /[locale]/account/orders    Order history
├── /[locale]/account/wishlist  Saved items
├── /[locale]/account/addresses Manage addresses
├── /[locale]/account/settings  Profile settings
├── /[locale]/memory/[slug]     Public QR Memory page
├── /[locale]/my-memories       User's memories list
├── /[locale]/my-memories/[id]/edit Edit a memory
├── /[locale]/cart              Full cart page
├── /[locale]/checkout          Checkout flow
├── /[locale]/order-confirmation/[id] Thank you + QR delivery
├── /[locale]/about             About page
├── /[locale]/contact           Contact page
├── /[locale]/shipping          Shipping info
├── /[locale]/returns           Return policy
├── /[locale]/terms             Terms & conditions
├── /[locale]/privacy           Privacy policy
├── /[locale]/Jewellery-care      Care instructions
├── /admin                      Admin dashboard
├── /admin/products             Manage products
└── /admin/orders               Manage orders
```

---

## 2. Homepage Sections (Simplified for Quiet Luxury)

We've simplified the homepage from 13 sections to 7 focused, elegant sections to provide breathing room and highlight the products and stories.

| # | Section | Layout | Background |
|---|---------|--------|------------|
| 1 | **Sticky Header** | Clean logo, cart, user, AR/EN language switcher | Warm White |
| 2 | **Hero Section** | Powerful hero image with elegant CTA, not an overwhelming slider | Image |
| 3 | **Brand Story Strip** | "A Story in Every Piece" + vision (subtle, elegant typography) | Charcoal |
| 4 | **Featured Collections** | 3-4 collection cards (elegant layout, not dense grids) | Warm White |
| 5 | **Memory Feature CTA** | The QR memory system explained elegantly with a visual | Warm Gold Gradient |
| 6 | **Testimonials** | 3 minimal cards emphasizing emotional connection | Warm White |
| 7 | **Footer** | Clean, minimal, bilingual links | Charcoal |

### Floating Elements
- **WhatsApp Button** — Bottom-right
- **Back to Top** — Bottom-left, appears on scroll

---

## 3. Product Detail Page Layout

```
┌──────────────────────────────────────────────────┐
│ Breadcrumbs: Home > Kids > Sunrise Set          │
├────────────────────┬─────────────────────────────┤
│                    │ Product Name                 │
│   IMAGE GALLERY    │                               │
│   (main + thumbs)  │ 85 AED  ̶1̶0̶9̶ ̶A̶E̶D̶           │
│   (Elegant space)  │ 📦 Available                 │
│                    │ 👶 Ages: 3-8 years           │
│                    │ 📐 Size / Material selector  │
│                    │ Qty: [-] 1 [+]              │
│                    │ [🛒 Add to Cart] [💳 Buy]    │
│                    │ ❤️ Wishlist | 📤 Share        │
│                    │ ┌────────────────────────┐  │
│                    │ │🎁 Includes QR Memory! │  │
│                    │ └────────────────────────┘  │
├────────────────────┴─────────────────────────────┤
│ [Description] [Shipping]                         │
├──────────────────────────────────────────────────┤
│ Related Products — horizontal slider             │
└──────────────────────────────────────────────────┘
```

---

## 4. Component Inventory

### Layout Components
| Component | Description |
|-----------|-------------|
| `LanguageSwitcher` | AR/EN toggle button |
| `Header` | Logo-centered sticky header with language support |
| `Footer` | 3-column footer + payment bar |
| `MobileMenu` | Full-screen slide-out menu |
| `Container` | Max-width wrapper (1280px) |
| `CartDrawer` | Side-panel cart overlay |

### Product Components
| Component | Description |
|-----------|-------------|
| `ProductCard` | Minimalist card: image + name + price |
| `ProductGrid` | Responsive grid with generous spacing |
| `ProductCarousel` | Horizontal scrollable row with arrows |
| `ProductImageGallery` | Main image + thumbnails with zoom |
| `QuantitySelector` | +/- stepper for quantity |
| `SortDropdown` | Sorting options dropdown |
| `ProductBadge` | Elegant 'new' / 'sale' / 'qr' / 'soldout' badge |

### Home Components
| Component | Description |
|-----------|-------------|
| `HeroSection` | Powerful single hero image and CTA |
| `BrandStoryStrip` | Elegant typography section |
| `CollectionShowcase` | Highlighted collections |
| `QRMemoryBanner` | The core memory feature CTA section |
| `TestimonialCards` | Minimal customer review cards |

### Memory Components
| Component | Description |
|-----------|-------------|
| `MemoryPageViewer` | PIN-protected QR memory display |
| `MemoryEditor` | Parent edit interface (3 photos + title + message) |
| `PhotoUploader` | Photo upload (max 3 images) |
| `PINEntry` | 4-digit PIN input for viewers |
| `QRCodeDisplay` | QR code image renderer |

### UI Components
| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, ghost variants (quiet luxury style) |
| `Badge` | Subtle pill badges |
| `Modal` | Overlay dialog |
| `Input` | Styled form input with label/error |
| `Spinner` | Loading indicator |
| `Toast` | Notification popups |
| `WhatsAppFloat` | Floating WhatsApp CTA |
| `BackToTop` | Scroll-to-top button |
| `Breadcrumbs` | Navigation breadcrumbs |
| `EmptyState` | Empty page placeholder |

---

## 5. Responsive Breakpoints

```css
@media (min-width: 480px)  { /* Large mobile  */ }
@media (min-width: 768px)  { /* Tablet        */ }
@media (min-width: 1024px) { /* Desktop       */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Product grid | 2 cols | 3 cols | 4 cols |
| Header | Hamburger | Hamburger | Full nav |
| Footer | Stacked | Stacked | 3 columns |
