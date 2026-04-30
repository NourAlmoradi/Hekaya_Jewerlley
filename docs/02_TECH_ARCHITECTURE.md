# 🛠️ Tech Stack & Architecture

> Technologies, database schema, API routes, and project structure for Hekaya Jewellery

---

## 1. Technology Overview

### Frontend
| Technology | Version | Purpose | Cost |
|------------|---------|---------|------|
| **Next.js** | 16.2.4 (App Router) | Full-stack React framework | Free |
| **React** | 19.2.4 | UI library | Free |
| **TypeScript** | 5 | Language | Free |
| **next-intl** | 4.x | **Bilingual Support (AR/EN)** | Free |
| **Tailwind CSS v4** | 4.x | Styling (CSS-only config) | Free |
| **Embla Carousel** | 8.x | Lightweight carousel | Free |
| **React Hook Form / Zod** | 7.x / 4.x | Forms & Validation | Free |
| **Lucide React** | 1.x | Icons | Free |
| **Sonner** | 2.x | Toast Notifications | Free |
| **qrcode** | 1.5.x | QR generation for Memory feature | Free |
| **framer-motion** | 12.x | Subtle animations | Free |
| **Zustand** | 5.x | Client state (cart, UI) | Free |
| **TanStack React Query** | 5.x | Server state management | Free |

### Backend
| Technology | Purpose | Cost |
|------------|---------|------|
| **Next.js API Routes** | Serverless backend | Free (Vercel) |
| **Supabase** | Database + Auth | Free tier |
| **Supabase Auth** | User authentication | Free |
| **Supabase PostgreSQL** | All data | Free (500MB) |
| **Supabase Storage** | Image storage (products + memories) | Free tier |

### Payment & Hosting
| Technology | Purpose | Cost |
|------------|---------|------|
| **Stripe** | Apple Pay & Mastercard | 2.9% + 1 AED/tx |
| **PayPal** | PayPal Checkout | ~3.9% + fixed AED/tx |
| **Vercel** | Hosting + CDN + SSL | Free tier |
| **GitHub** | Code repository | Free |

> **Note:** We use Stripe exclusively to securely process Apple Pay and Mastercard, and PayPal to process PayPal balances.

---

## 2. Database Schema

> **10 tables total** — kept simple and clean, no unnecessary complexity.

### `profiles` — User profiles (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
  total_storage_used_mb DECIMAL(10,2) DEFAULT 0,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'AE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `categories` — Product categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES categories(id),
  is_kids BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `products` — Product catalog
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  currency TEXT DEFAULT 'AED',
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_kids BOOLEAN DEFAULT false,
  has_qr_memory BOOLEAN DEFAULT true,
  purchase_count INT DEFAULT 0,
  weight_grams INT,
  material TEXT,
  age_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** No `stock_quantity` — inventory tracking is not used.

### `product_variations` — Size/material options per product
```sql
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  material TEXT,
  price_override DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `orders` — Customer orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  payment_method TEXT,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_region TEXT,
  shipping_postal TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** `discount` column removed — no coupon system.

### `order_items` — Items within orders
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  qr_memory_id UUID REFERENCES qr_memories(id)
);
```

### `qr_memories` — QR Memory pages (UNIQUE FEATURE)
```sql
CREATE TABLE qr_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  order_item_id UUID,
  qr_code_url TEXT,
  public_slug TEXT UNIQUE NOT NULL,
  title TEXT,
  message TEXT,
  pin_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** Simplified from previous version. No child profile fields (name/birthdate/photo) — just title, message, PIN, and photos. Privacy is PIN-only (no public/private toggle).

### `memory_photos` — Photos for QR memories (max 3 per memory)
```sql
CREATE TABLE memory_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES qr_memories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** Renamed from `memory_media`. Photos only (no video/text types). Max 3 photos per memory enforced at API level.

### `wishlist` — User saved products
```sql
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### `addresses` — User saved shipping addresses
```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'AE',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. API Routes

```
src/app/api/
├── auth/           POST register, login, reset-password
├── products/       GET list (with filters), GET [id] detail
├── categories/     GET list
├── cart/           GET/POST/PUT/DELETE operations
├── orders/         GET user orders, POST create, GET [id] detail
├── payment/
│   ├── stripe/     POST create Stripe PaymentIntent
│   ├── paypal/     POST create PayPal Order
│   └── webhook/    POST payment callback (Stripe webhook)
├── qr-memory/
│   ├── [slug]/     GET view (requires PIN)
│   ├── [slug]/edit PUT update (owner only)
│   └── [slug]/photos POST upload (max 3), GET list, DELETE
├── wishlist/       GET/POST/DELETE
├── upload/         POST file upload (to Supabase Storage)
└── admin/          CRUD for products, orders
```

---

## 4. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # ⚠️ Server-only! No NEXT_PUBLIC_

# Stripe
STRIPE_SECRET_KEY=                  # ⚠️ Server-only!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=       
PAYPAL_CLIENT_SECRET=               # ⚠️ Server-only! No NEXT_PUBLIC_

# Supabase Storage uses NEXT_PUBLIC_SUPABASE_URL

# Site
NEXT_PUBLIC_SITE_URL=https://hekaya-Jewellery.com
NEXT_PUBLIC_SITE_NAME=Hekaya Jewellery
NEXT_PUBLIC_WHATSAPP_NUMBER=+971XXXXXXXXX
ADMIN_EMAIL=admin@hekaya-Jewellery.com
```

---

## 5. Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.2.4",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "next-intl": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.5.0",
    "@stripe/stripe-js": "^5.0.0",
    "stripe": "^17.0.0",
    "@paypal/react-paypal-js": "^8.0.0",

    "embla-carousel-react": "^8.0.0",
    "lucide-react": "^1.0.0",
    "sonner": "^2.0.0",
    "qrcode": "^1.5.0",
    "sharp": "^0.34.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^4.0.0",
    "framer-motion": "^12.0.0",
    "nanoid": "^5.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^3.0.0"
  }
}
```


