# 🎨 Brand & Design System

> Hekaya Jewelry — A premium children's jewelry brand that captures memories for a lifetime
> **"A Story in Every Piece" / "في كل قطعة… حكاية"**

---

## 1. Brand Identity

### Brand Name
- **Arabic:** مجوهرات حكاية (Hekaya Jewelry)
- **English:** Hekaya Jewelry
- **Tagline Arabic:** في كل قطعة… حكاية
- **Tagline English:** A Story in Every Piece

### The Hekaya Vision (الرؤية)
**"To become the definitive destination for moments worth keeping forever — through jewelry that carries meaning across generations."**
"أن تصبح “حكاية” المرجع الأول لكل لحظة تُراد أن تُحفظ للأبد — عبر قطعة تُلبس وتُورث."

### The Hekaya Mission (المهمة)
**"We craft meaningful pieces that capture life’s earliest moments, transforming them into lasting stories you can wear."**
"نصمم قطعًا تحمل معنى عاطفيًا عميقًا، تُوثّق بدايات الحياة ولحظاتها الأولى، لتبقى ذكرى حيّة مع كل من يرتديها."

### The 6 Core Values (القيم)
1. **Meaning Over Ornament / المعنى قبل الشكل**
   We do not design solely for adornment, but to represent a moment of value. (نحن لا نصمم للزينة فقط، بل لتمثيل لحظة لها قيمة.)
2. **Timeless Memory / الذكرى الخالدة**
   Every piece should outlive the moment it was created for. (كل قطعة يجب أن تعيش أطول من اللحظة التي صنعت لأجلها.)
3. **Emotional Authenticity / العاطفة الصادقة**
   We reject any design that doesn't evoke a genuine feeling. (نرفض أي تصميم لا يحرّك شعورًا حقيقيًا.)
4. **Quiet Luxury / الفخامة الهادئة**
   Our luxury is felt, not flaunted. (الفخامة لدينا تُشعر… ولا تتباهى.)
5. **Obsessive Craftsmanship / الاهتمام بالتفاصيل**
   The tiny details create the true value of the piece. (التفاصيل الصغيرة هي التي تصنع قيمة القطعة.)
6. **Designed to be Passed On / قابلية التوريث**
   We design today... to be worn tomorrow and inherited years later. (نصمم اليوم… ليُلبس غدًا ويُورث بعد سنوات.)

### Logo Requirements
- **Style:** Minimalist, elegant, quiet luxury mark
- **Text:** "Hekaya Jewelry" / "مجوهرات حكاية"
- **Colors:** Warm Gold (#C9A96E) and Charcoal Black (#1A1A1A)
- **Vibe:** Heritage-inspired, clean, timeless.

---

## 2. Color Palette

### Primary Colors (Quiet Luxury)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#C9A96E` | Primary buttons, accents, logo (Warm Gold) |
| `--color-primary-dark` | `#B8944D` | Hover states |
| `--color-primary-light` | `#E0D3B8` | Subtle highlights |

### Neutral Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#FAFAF8` | Main background (Warm White) |
| `--color-bg-secondary` | `#F2F0EB` | Secondary sections |
| `--color-bg-footer` | `#1A1A1A` | Footer background (Charcoal Black) |
| `--color-text-primary` | `#1A1A1A` | Headings and primary text |
| `--color-text-secondary` | `#666666` | Subtitles and descriptive text |
| `--color-border` | `#EAE6E0` | Card borders, dividers |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#4A7C59` | In stock, success |
| `--color-error` | `#C45B5B` | Errors, sold out |
| `--color-whatsapp` | `#25D366` | WhatsApp button |

---

## 3. Typography

### Font Selection
| Purpose | Font | Language |
|---------|------|----------|
| **English Headings** | Cormorant Garamond | English |
| **English Body** | Inter | English |
| **Arabic Headings** | Amiri | Arabic |
| **Arabic Body** | Noto Sans Arabic | Arabic |

### Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@300;400;500;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
```

---

## 4. Spacing & Layout

### Layout Constants
| Element | Value |
|---------|-------|
| Container max-width | 1280px |
| Header height | 80px |
| Grid columns (desktop) | 4 |
| Grid gap | 24px (desktop), 16px (mobile) |

### Border Radius (Refined & Elegant)
| Element | Value |
|---------|-------|
| Product cards | 4px (minimalist) |
| Buttons | 4px |
| Input fields | 4px |
| Images | 0px or 4px |

---

## 5. Photography Style Guide

### Product Photos
| Aspect | Style |
|--------|-------|
| **Background** | Clean warm white or soft textured stone |
| **Display** | Elegant displays, natural light |
| **Lighting** | Soft, diffused, warm tones |
| **Ratio** | 4:5 vertical or 1:1 square |

### Lifestyle Photos
| Aspect | Style |
|--------|-------|
| **Models** | Children and parents capturing intimate, authentic moments |
| **Tone** | Warm, emotional, heirloom quality |
| **Focus** | Focus on the connection and the piece being worn |

---

## 6. Complete CSS Variables

See `src/app/globals.css` for the full CSS variables template with all tokens defined above.
