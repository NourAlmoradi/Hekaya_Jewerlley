# 🔐 Security & Authentication

> How to keep Hekaya Jewelry secure — beginner-friendly with professional results

---

## 1. Authentication (Supabase Auth)

### Methods to Enable
| Method | Priority | Notes |
|--------|----------|-------|
| **Email + Password** | ✅ Required | Works out of the box |
| **Phone (SMS OTP)** | ✅ Recommended | Popular in UAE/GCC |
| **Google OAuth** | 🟡 Optional | Easy to add |

### Auth Flow
```
REGISTER: Email + Password + Name + Phone
  → Supabase creates user → auto-creates profile → sends verification email

LOGIN: Email + Password (or Phone OTP)
  → Returns JWT (stored in httpOnly cookie) → user authenticated

PASSWORD RESET: Enter email → reset link → new password
```

### Supabase Client Setup
```typescript
// lib/supabase/client.ts (Browser)
import { createBrowserClient } from '@supabase/ssr';
export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// lib/supabase/server.ts (Server-side)
import { createServerClient } from '@supabase/ssr';
// Uses cookies for session management

// lib/supabase/admin.ts (Admin-only, service role)
// ⚠️ NEVER expose service role key to client
```

---

## 2. Row Level Security (RLS)

> **RLS ensures users can only access their own data**, even if your code has a bug.

### Enable on ALL tables:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ... all tables
```

### Key Policies
| Table | Rule | Policy |
|-------|------|--------|
| `profiles` | Users see own profile only | `auth.uid() = id` |
| `products` | Anyone can view active products | `is_active = true` |
| `products` | Only admins can edit | `role = 'admin'` check |
| `orders` | Users see own orders | `auth.uid() = user_id` |
| `orders` | Admins see all | Admin role check |
| `qr_memories` | Public memories viewable by all | `is_public = true` |
| `qr_memories` | Owners can edit theirs | `auth.uid() = user_id` |
| `memory_media` | Viewable if parent memory is public | Join check |
| `memory_media` | Only owner can upload/delete | Owner check |
| `wishlist` | Users manage own only | `auth.uid() = user_id` |

---

## 3. Admin Role System

### Create Admin (SQL)
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';
```

### Protect Admin Routes (proxy.ts — Next.js 16)
```typescript
// Check if user has admin role before allowing /admin/* access
// Redirect non-admins to homepage
// Redirect unauthenticated users to login
```

### Protected Routes
| Route Pattern | Requires |
|---------------|----------|
| `/admin/*` | Logged in + admin role |
| `/account/*` | Logged in |
| `/my-memories/*` | Logged in |
| `/checkout` | Logged in |

---

## 4. File Upload Security

```typescript
// Always validate on SERVER:
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE = 5 * 1024 * 1024;   // 5MB
const MAX_PHOTOS_PER_MEMORY = 3;     // Max 3 photos per QR memory

// Generate safe filenames (prevent path traversal)
const safeName = `${userId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;
```

---

## 5. Critical Security Rules

| Rule | Why |
|------|-----|
| **Never trust client data** | Always validate on server |
| **Calculate prices server-side** | Never let client set the price |
| **No service role key in NEXT_PUBLIC_** | Would expose full database access |
| **Verify payment webhook signatures** | Prevent fake payment confirmations |
| **Sanitize all input** | Prevent XSS attacks |
| **Limit string lengths** | Prevent resource exhaustion |

---

## 6. Pre-Launch Security Checklist

- [ ] All secrets in `.env.local` (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] No service role key exposed to client
- [ ] HTTPS enabled (Vercel automatic)
- [ ] RLS enabled on ALL tables
- [ ] RLS policies tested
- [ ] Admin role cannot be self-assigned
- [ ] File type validation (server-side)
- [ ] File size limits enforced
- [ ] Payment webhook validates signature
- [ ] Prices calculated on server
- [ ] Error messages don't leak internal details
