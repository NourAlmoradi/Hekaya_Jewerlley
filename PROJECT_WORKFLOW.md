# Hekaya Jewellery — Complete Project Workflow

> **مجوهرات حكاية — "في كل قطعة… حكاية"**
> A children's Jewellery e-commerce platform with a unique QR Memory system.
> This document describes the full business flow, user experience, and system behavior.

---

## 1. What is Hekaya Jewellery?

Hekaya Jewellery is a **bilingual (Arabic/English)** online Jewellery store targeting the **UAE market**. The store primarily sells **children's Jewellery** but also serves all age groups.

Every eligible Jewellery piece comes with a **unique QR Memory code** — a physical card containing a QR code that unlocks a private digital memory page. Parents scan the QR, upload photos and a heartfelt message, and create a keepsake that lasts forever.

**What makes this different from any other Jewellery store:**

| Normal Jewellery Shop | Hekaya Jewellery |
|---|---|
| Customer buys → Customer forgets | Customer buys → Receives QR card |
| No emotional connection | Scans QR → Uploads precious photos |
| One-time purchase | Creates a memory they revisit forever |
| No reason to come back | Emotional bond → Returns to buy again |

---

## 2. Customer Shopping Journey

```mermaid
flowchart TD
    A["🏠 Customer visits Hekaya website"] --> B["🛍️ Browses products"]
    B --> C["💍 Selects a product"]
    C --> D["📐 Chooses variation\n(size, material)"]
    D --> E["🛒 Adds to cart"]
    E --> F{"Continue shopping?"}
    F -->|Yes| B
    F -->|No| G["📦 Proceeds to checkout"]
    G --> H["🔐 Login / Register\n(account required)"]
    H --> I["📋 Step 1: Shipping address"]
    I --> J["📝 Step 2: Review order\n+ Choose QR option"]
    J --> K["💳 Step 3: Pay with Tap Payments\n(Visa / MC / Apple Pay)"]
    K --> L{"Payment successful?"}
    L -->|No| M["❌ Payment failed\nRetry or cancel"]
    L -->|Yes| N["✅ Order confirmed!"]
    N --> O["📧 Confirmation email sent"]
    N --> P["🔲 QR code generated\n(if QR option selected)"]
    P --> Q["📬 Jewellery + QR card\nshipped to customer"]
    Q --> R["📱 Customer scans QR card"]
    R --> S["🔑 Enters 4-digit PIN"]
    S --> T["📸 Uploads 3 photos\n+ title + message"]
    T --> U["💕 Memory saved forever!\nEditable anytime"]

    style A fill:#C9A96E,color:#1A1A1A
    style N fill:#4A7C59,color:white
    style U fill:#C9A96E,color:#1A1A1A
    style M fill:#C45B5B,color:white
```

---

## 3. QR Memory System — The Core Feature

### 3.1 How QR Codes Are Created

At checkout, the customer chooses whether to add a QR Memory to their order:
- **Per order** — One QR code for the entire order
- **Per piece** — A separate QR code for each Jewellery piece

After payment is confirmed, the system:
1. Generates a unique token (random 8-character code)
2. Creates a QR code image pointing to `hekaya-Jewellery.com/memory/[token]`
3. Stores the QR in the database as **inactive** (no memories yet)
4. QR code is printed on a physical card and placed inside the Jewellery packaging

### 3.2 How QR Memories Work

```mermaid
flowchart TD
    A["📱 Customer scans QR code\non physical card"] --> B["🌐 Opens:\nhekaya-Jewellery.com/memory/abc123"]
    B --> C{"Memory page\nhas content?"}
    
    C -->|"No (first time)"| D["🔐 Login required\nto set up memory"]
    D --> E["📸 Upload up to 3 photos"]
    E --> F["✏️ Add title + message"]
    F --> G["🔑 Set 4-digit PIN\nfor viewers"]
    G --> H["✅ Memory created!"]
    
    C -->|"Yes (returning)"| I{"Who is visiting?"}
    I -->|"Owner (logged in)"| J["👁️ View memory\n+ Edit button"]
    I -->|"Anyone else"| K["🔑 Enter 4-digit PIN"]
    K --> L{"PIN correct?"}
    L -->|Yes| M["👁️ View memory\n(read-only)"]
    L -->|No| N["❌ Wrong PIN\nTry again"]
    
    J --> O{"Want to edit?"}
    O -->|Yes| P["✏️ Update photos,\ntitle, or message"]
    O -->|No| Q["Done"]

    style A fill:#C9A96E,color:#1A1A1A
    style H fill:#4A7C59,color:white
    style M fill:#4A7C59,color:white
    style N fill:#C45B5B,color:white
```

### 3.3 Memory Page Content

Each memory page contains:

| Element | Details | Limit |
|---|---|---|
| **Photos** | High-quality images, compressed automatically | Max 3 photos |
| **Title** | Short heading (e.g. "يوم ميلاد ليان") | 100 characters |
| **Message** | Heartfelt text from the parent | 500 characters |
| **PIN** | 4-digit code to protect privacy | Required |

### 3.4 QR Properties

| Property | Value |
|---|---|
| Expires? | Never |
| Editable? | Yes — owner can update anytime |
| Who can view? | Anyone with the PIN |
| Who can edit? | Only the owner (logged in) |
| Max photos | 3 per memory |
| Cost to customer | Included with eligible products |

---

## 4. Website Pages

### 4.1 Customer-Facing Pages

```mermaid
flowchart LR
    subgraph Public["🌐 Public Pages"]
        HOME["🏠 Homepage"]
        PRODUCTS["🛍️ Shop All"]
        PRODUCT["💍 Product Detail"]
        ABOUT["ℹ️ About"]
        CONTACT["📞 Contact"]
        POLICIES["📄 Policies"]
    end
    
    subgraph Auth["🔐 Auth Pages"]
        LOGIN["🔑 Login"]
        REGISTER["📝 Register"]
        FORGOT["🔄 Forgot Password"]
    end
    
    subgraph Protected["🔒 Logged-In Only"]
        ACCOUNT["👤 My Account"]
        ORDERS["📦 My Orders"]
        ADDRESSES["📍 My Addresses"]
        WISHLIST["❤️ Wishlist"]
        MEMORIES["🔲 My QR Memories"]
        CHECKOUT["💳 Checkout"]
    end
    
    subgraph QR["📱 QR Pages"]
        MEMORY["🖼️ Memory Page\n(PIN protected)"]
    end

    HOME --> PRODUCTS
    PRODUCTS --> PRODUCT
    PRODUCT --> CHECKOUT
    ACCOUNT --> ORDERS
    ACCOUNT --> ADDRESSES
    ACCOUNT --> WISHLIST
    ACCOUNT --> MEMORIES
```

### 4.2 Admin Pages

| Page | What admin does there |
|---|---|
| **Dashboard** | See today's orders, revenue at a glance |
| **Products** | Add, edit, delete products and their variations (size/material) |
| **Orders** | View all orders, update status (processing → shipped → delivered) |

---

## 5. Payment Flow

### 5.1 Payment Provider: Tap Payments

| Detail | Value |
|---|---|
| **Provider** | [Tap Payments](https://tap.company) (tap.company) |
| **Methods** | Visa, Mastercard, Apple Pay |
| **Currency** | AED only |
| **Fees** | ~2.75% per transaction |
| **Settlement** | 2-3 business days to UAE bank |
| **Test mode** | Full sandbox for development |

### 5.2 Checkout Steps

```mermaid
flowchart LR
    A["🛒 Cart"] --> B["📋 Step 1:\nShipping Address"]
    B --> C["📝 Step 2:\nReview Order\n+ QR Option"]
    C --> D["💳 Step 3:\nTap Payments"]
    D --> E["✅ Order\nConfirmed"]
    E --> F["📧 Email\nSent"]

    style A fill:#f2f0eb
    style E fill:#4A7C59,color:white
```

### 5.3 Shipping

- Customer pays **actual shipping cost** (calculated at checkout based on location within UAE)
- No free shipping threshold
- No COD — online payment only

---

## 6. Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Customer places order
    Pending --> Paid: Payment confirmed
    Paid --> Processing: Admin starts preparing
    Processing --> Shipped: Package sent + tracking number added
    Shipped --> Delivered: Customer received
    Delivered --> [*]
    
    Pending --> Cancelled: Payment failed / Customer cancels
    Cancelled --> [*]
```

| Status | Who triggers it | What happens |
|---|---|---|
| **Pending** | System (auto) | Order created, awaiting payment |
| **Paid** | Tap Payments webhook | Payment confirmed |
| **Processing** | Admin | Order being prepared |
| **Shipped** | Admin | Tracking number added, customer notified |
| **Delivered** | Admin | Order complete |
| **Cancelled** | System or Admin | Payment failed or manual cancel |

---

## 7. Product Catalog

### 7.1 Product Structure

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ VARIATIONS : "has sizes/materials"
    PRODUCTS ||--o{ IMAGES : displays
    
    CATEGORIES {
        string name_ar
        string name_en
        string image
    }
    
    PRODUCTS {
        string name_ar
        string name_en
        decimal price
        string description
        boolean has_qr_memory
        boolean is_active
    }
    
    VARIATIONS {
        string size
        string material
        decimal price_override
    }
```

### 7.2 Product Features

| Feature | Details |
|---|---|
| **Categories** | Organized by type (rings, necklaces, bracelets, etc.) with AR/EN names |
| **Variations** | Size and material options per product, each can have its own price |
| **QR Badge** | Products eligible for QR Memory show a special badge |
| **Bilingual** | All product info in both Arabic and English |
| **No inventory tracking** | Products don't track stock counts |

---

## 8. User Account

When a customer logs in, they can access:

| Section | What they see |
|---|---|
| **My Orders** | List of all past orders with status tracking |
| **My QR Memories** | All their QR memory pages, with edit access |
| **My Addresses** | Saved shipping addresses for faster checkout |
| **Wishlist** | Saved products they want to buy later |

---

## 9. Admin Dashboard

Two roles can access the admin area: **Owner** and **Store Manager**.

### What admin can do:

```mermaid
flowchart TD
    ADMIN["🔐 Admin Login"] --> DASH["📊 Dashboard\nToday's orders & revenue"]
    ADMIN --> PROD["💍 Products"]
    ADMIN --> ORD["📦 Orders"]
    
    PROD --> PROD_ADD["➕ Add new product\n(name, price, images,\nvariations, QR eligible)"]
    PROD --> PROD_EDIT["✏️ Edit product"]
    PROD --> PROD_DEL["🗑️ Delete product"]
    
    ORD --> ORD_VIEW["👁️ View order details"]
    ORD --> ORD_STATUS["🔄 Update status\n(processing → shipped → delivered)"]
    ORD --> ORD_TRACK["📮 Add tracking number"]
```

---

## 10. System Architecture (High-Level)

```mermaid
flowchart TB
    subgraph Customer["👤 Customer"]
        BROWSER["📱 Browser / Phone"]
    end
    
    subgraph Frontend["🖥️ Website"]
        NEXTJS["Next.js App\n(Arabic + English)"]
    end
    
    subgraph Backend["⚙️ Backend Services"]
        API["API Routes\n(Order, QR, Upload)"]
        AUTH["Authentication\n(Supabase Auth)"]
    end
    
    subgraph Storage["🗄️ Data Storage"]
        DB["PostgreSQL Database\n(Supabase)"]
        FILES["Image Storage\n(Supabase Storage)"]
    end
    
    subgraph Payment["💳 Payment"]
        TAP["Tap Payments"]
    end
    
    subgraph Hosting["🌐 Hosting"]
        VERCEL["Vercel\n(Global CDN)"]
    end
    
    BROWSER <--> VERCEL
    VERCEL <--> NEXTJS
    NEXTJS <--> API
    API <--> AUTH
    API <--> DB
    API <--> FILES
    API <--> TAP

    style Customer fill:#C9A96E,color:#1A1A1A
    style Payment fill:#4A7C59,color:white
```

---

## 11. Data Model (Simplified)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ WISHLIST : saves
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ QR_MEMORIES : owns
    
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDER_ITEMS }o--|| PRODUCTS : references
    ORDER_ITEMS }o--o| VARIATIONS : "optional variation"
    
    ORDERS ||--o{ QR_MEMORIES : generates
    QR_MEMORIES ||--o{ MEMORY_PHOTOS : contains
    
    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS ||--o{ VARIATIONS : "has options"
    
    USERS {
        uuid id
        string name
        string email
        string phone
        int storage_used_mb
    }
    
    PRODUCTS {
        uuid id
        string name_ar_en
        decimal price
        boolean has_qr_memory
    }
    
    ORDERS {
        uuid id
        string order_number
        decimal total
        string status
    }
    
    QR_MEMORIES {
        uuid id
        string unique_token
        string title
        string message
        string pin_code
        boolean is_active
    }
    
    MEMORY_PHOTOS {
        uuid id
        string image_url
        int sort_order
    }
```

**Tables summary:**

| Table | Purpose |
|---|---|
| `profiles` | User accounts (extends auth) |
| `categories` | Product categories (AR/EN) |
| `products` | Product catalog (AR/EN) |
| `product_variations` | Size/material options per product |
| `orders` | Customer orders |
| `order_items` | Items within each order |
| `qr_memories` | QR code data + memory content |
| `memory_photos` | Photos attached to memories (max 3) |
| `wishlist` | User's saved products |
| `addresses` | User's saved shipping addresses |

**Total: 10 tables** (clean, no unnecessary complexity)

---

## 12. Cost Breakdown

### Monthly Operating Cost

| Phase | Monthly Cost | When |
|---|---|---|
| **Launch** | **$0/month** | Day 1 — First 3 months |
| **Growth** | **~$45/month** | When traffic exceeds free tiers |
| **Scale** | **~$100-200/month** | 20,000+ visitors/month |

### Service Costs

| Service | Launch (Free) | Growth | Purpose |
|---|---|---|---|
| Vercel (Hosting) | $0 | $20/mo | Website hosting + CDN |
| Supabase (Database) | $0 | $25/mo | Database + Auth |
| Supabase Storage (Images) | $0 | Pay-per-use | Photo storage |
| Tap Payments | ~2.75%/tx | ~2.75%/tx | Payment processing |
| Domain | ~$12/year | ~$12/year | hekaya-Jewellery.com |

### First Year Total: ~$12 (domain only) + payment processing fees

---

## 13. Technology Summary

| Layer | Technology | Why |
|---|---|---|
| Website | Next.js (React) | Fast, SEO-friendly, bilingual support |
| Language | TypeScript | Catches bugs early |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth, real-time |
| Auth | Supabase Auth | Email/password registration |
| Image Storage | Supabase Storage | Seamless integration with Supabase Auth |
| Payments | Tap Payments | Best for UAE market |
| QR Generation | qrcode library | Generates QR code images |
| Hosting | Vercel | Free, global CDN, auto-deploy |
| Bilingual | next-intl | Full Arabic/English support |

---

## 14. Key Business Decisions (Confirmed)

| Decision | Answer |
|---|---|
| Target market | UAE only |
| Currency | AED only |
| Languages | Arabic (default) + English |
| Payment | Tap Payments (online only, no COD) |
| QR per | Customer chooses: per order or per piece |
| Memory content | 3 photos + title + message |
| Memory privacy | 4-digit PIN required to view |
| Memory editing | Owner can edit anytime (login required) |
| Product variations | Yes (size, material, price override) |
| Inventory tracking | No |
| Shipping | Customer pays actual cost |
| Reviews system | No |
| Coupon system | No |
| Admin roles | Owner + Store Manager |

---

<p align="center">
  <strong>Hekaya Jewellery</strong> — مجوهرات حكاية<br>
  "A Story in Every Piece" / "في كل قطعة… حكاية"<br><br>
  <em>Document prepared for project approval</em>
</p>
