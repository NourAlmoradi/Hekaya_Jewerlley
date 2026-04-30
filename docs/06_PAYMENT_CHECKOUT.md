# 💳 Payment & Checkout

> How to accept payments securely for Hekaya Jewellery

---

## 1. Payment Gateways: Stripe + PayPal

As requested, checkout strictly supports **Apple Pay, Mastercard, and PayPal**. We handle this seamlessly via two robust integrations:

| Feature | Stripe (Apple Pay & Mastercard) | PayPal (PayPal Checkout) |
|---------|---------------------------------|--------------------------|
| **Supported Methods** | Apple Pay, Mastercard | PayPal Balance & Linked Accounts |
| **Pricing** | 2.9% + 1 AED per transaction | ~3.9% + fixed AED per tx |
| **Settlement** | 2-7 business days | Immediate to PayPal balance |
| **Test Mode** | Full test environment via keys | Sandbox mode |

> **💡 Note:** Visa and other card types can technically be processed by Stripe, but the primary user-facing options will emphasize Apple Pay, Mastercard, and PayPal to match the business requirement.

### Stripe Test Cards (Mastercard)
| Card Number | Type | Result |
|-------------|------|--------|
| `5555 5555 5555 4444` | MC | Success |

### PayPal Sandbox
You will create a Sandbox Personal account in your PayPal Developer dashboard to test PayPal purchases without using real money.

---

## 2. Checkout Flow

```
CART → CHECKOUT (3 steps) → CONFIRMATION
  
Step 1: Shipping Info (name, phone, address, emirate, area)
Step 2: Review Order (items, subtotal, shipping, total) + Choose QR option
Step 3: Payment (Select Apple Pay/Mastercard OR PayPal)
  
→ Payment Success → Order Confirmed + QR Code Generated!
```

---

## 3. Server-Side Payment Flow

```typescript
// 1. Customer clicks "Pay"
// 2. Server creates order in DB
// 3. Server calculates total (NEVER trust client price!)
// 4. Server sends payment request to Stripe API or PayPal API
// 5. Customer completes payment on Stripe Elements or PayPal Popup
// 6. Stripe sends webhook to /api/payment/webhook (PayPal handles approval directly)
// 7. Server verifies payment → updates order status
// 8. Server generates QR codes (if customer selected QR option)
// 9. Server sends confirmation email
```

### Critical: Always Calculate Server-Side
```typescript
// ❌ WRONG: Trust client total
const total = req.body.total;

// ✅ RIGHT: Calculate from database
const items = await getOrderItems(orderId);
const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
```

---

## 4. Shipping Costs

Customers pay **actual shipping cost** based on their location within the UAE. Shipping cost is calculated at checkout.

```typescript
const SHIPPING = {
  dubai:          { cost: 0, days: '1-2' },
  abu_dhabi:      { cost: 15, days: '1-3' },
  sharjah:        { cost: 10, days: '1-2' },
  other_emirates: { cost: 25, days: '2-4' },
};
// No free shipping threshold — customer always pays actual cost
```

---

## 5. Order Numbers

Format: `HK-YYYYNNNNN` (e.g., `HK-202600042`)

---

## 6. Payment Security Checklist

- [ ] Use test keys (Stripe) and sandbox client IDs (PayPal) during development
- [ ] Live keys only in Production environment
- [ ] Webhook validates Stripe signature with `whsec_` secret
- [ ] Prices always calculated server-side
- [ ] Order totals verified before payment
- [ ] No inventory tracking needed (confirmed)
