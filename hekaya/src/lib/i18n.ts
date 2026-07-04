export type Locale = "ar" | "en";

export const translations = {
  // Common
  brand: { ar: "مشاعر", en: "Mashaer" },
  brandFull: { ar: "مجوهرات مشاعر", en: "Mashaer Jewellery" },
  tagline: {
    ar: "بعض المشاعر تستحق الخلود",
    en: "Some Feelings Deserve Eternity",
  },

  // Nav
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_shop: { ar: "المتجر", en: "Shop" },
  nav_collections: { ar: "المجموعات", en: "Collections" },
  nav_qr: { ar: "ذكرى QR", en: "QR Memory" },
  nav_about: { ar: "عن مشاعر", en: "About" },
  nav_contact: { ar: "تواصل معنا", en: "Contact" },
  nav_account: { ar: "حسابي", en: "Account" },
  nav_admin: { ar: "لوحة التحكم", en: "Admin" },
  nav_cart: { ar: "السلة", en: "Cart" },
  nav_search: { ar: "بحث", en: "Search" },
  nav_menu: { ar: "القائمة", en: "Menu" },

  // Hero
  hero_eyebrow: {
    ar: "مجوهرات الأطفال الفاخرة",
    en: "Premium Children's Jewellery",
  },
  hero_title: { ar: "كل قطعة… تحمل مشاعر", en: "Every Piece Holds a Feeling" },
  hero_subtitle: {
    ar: "مجوهرات مصممة بدقة، تحمل ذكرى رقمية محفوظة برمز QR — لتبقى لحظاتكم خالدة، تُلبس وتُورث.",
    en: "Crafted jewellery with a private QR memory keepsake — for moments worth keeping forever, worn today and inherited tomorrow.",
  },
  hero_cta_shop: { ar: "تسوق المجموعة", en: "Shop the Collection" },
  hero_cta_learn: { ar: "اكتشف ذكرى QR", en: "Discover QR Memory" },

  // Hero slides (3 auto-rotating)
  hero_slide1_eyebrow: { ar: "رؤيتنا", en: "Our Vision" },
  hero_slide1_title_a: { ar: "فخامةٌ", en: "Luxury" },
  hero_slide1_title_b: { ar: "تنبض بالمشاعر", en: "That Feels" },
  hero_slide1_sub: {
    ar: "أن نُصبح الدار الأرقى والأعمق إحساسًا في عالم مجوهرات الأطفال بالخليج والعالم العربي.",
    en: "To become the most emotional and luxurious children's jewellery house across the Gulf and the Arab world.",
  },

  hero_slide2_eyebrow: { ar: "إرثٌ يبقى", en: "A Lasting Legacy" },
  hero_slide2_title_a: { ar: "لحظاتٌ عابرة", en: "Fleeting Moments," },
  hero_slide2_title_b: { ar: "تصبح إرثًا", en: "Made Eternal" },
  hero_slide2_sub: {
    ar: "نُحوّل أثمن اللحظات الإنسانية إلى إرثٍ فاخرٍ يُتوارث جيلًا بعد جيل.",
    en: "We transform life's most precious moments into luxurious heirlooms, treasured for generations.",
  },

  hero_slide3_eyebrow: { ar: "لكل طفل", en: "For Every Child" },
  hero_slide3_title_a: { ar: "تُلبَس اليوم", en: "Worn Today," },
  hero_slide3_title_b: { ar: "وتُورَّث غدًا", en: "Inherited Tomorrow" },
  hero_slide3_sub: {
    ar: "كنوزٌ تُصاغ لأحبّ الصغار؛ تُلبَس بحبٍّ وتُورَّث بفخر.",
    en: "Treasures crafted for the little ones — worn with love today, passed down with pride tomorrow.",
  },

  // Trust
  trust_quality: { ar: "خامات أصلية", en: "Authentic Materials" },
  trust_quality_d: { ar: "ذهب معتمد", en: "Certified gold " },
  trust_qr: { ar: "ذكرى QR مجانية", en: "Free QR Memory" },
  trust_qr_d: { ar: "مع كل قطعة مؤهلة", en: "With every eligible piece" },

  // Sections
  collections_title: { ar: "تصفح المجموعات", en: "Browse Collections" },
  collections_sub: {
    ar: "اختاري قطعتك المفضلة من بين تشكيلتنا الفاخرة",
    en: "Find your favourite from our curated edit",
  },
  collections_page_eyebrow: { ar: "عالم مشاعر", en: "The Mashaer Edit" },
  collections_page_title: { ar: "مجموعاتنا", en: "Our Collections" },
  collections_page_sub: {
    ar: "كل مجموعة تروي حكاية — اختاري عالمكِ وابدئي رحلة من القطع التي تستحقّ أن تُورث.",
    en: "Each collection tells a story — pick your world and begin a journey through pieces worth keeping.",
  },
  collection_pieces: { ar: "قطعة", en: "pieces" },
  view_collection: { ar: "استعرضي المجموعة", en: "View Collection" },
  no_collections: { ar: "لا توجد مجموعات بعد", en: "No collections yet" },
  featured_title: { ar: "القطع المميزة", en: "Featured Pieces" },
  featured_sub: {
    ar: "أحدث ما يستحق أن يُهدى ويُورث",
    en: "Newest treasures worth gifting and keeping",
  },
  view_all: { ar: "عرض الكل", en: "View All" },

  qr_section_eyebrow: { ar: "تجربة حصرية", en: "An Exclusive Experience" },
  qr_section_title: {
    ar: "قصة لا تُنسى مع كل قطعة",
    en: "An Unforgettable Story With Every Piece",
  },
  qr_section_desc: {
    ar: "كل قطعة تأتي مع بطاقة QR خاصة. امسحها، وارفعي ٣ صور ورسالة من القلب، لتصنعي ذكرى رقمية محمية بـ PIN تبقى للأبد.",
    en: "Every piece arrives with a private QR card. Scan it, upload up to 3 photos and a message, and craft a PIN-protected digital memory that lasts a lifetime.",
  },
  qr_step1_t: { ar: "امسح الرمز", en: "Scan the Code" },
  qr_step1_d: {
    ar: "بطاقة فاخرة داخل العلبة",
    en: "Premium card inside the box",
  },
  qr_step2_t: { ar: "أنشئ الذكرى", en: "Create the Memory" },
  qr_step2_d: { ar: "صور، عنوان، ورسالة", en: "Photos, title, and message" },
  qr_step3_t: { ar: "احتفظ بها للأبد", en: "Keep It Forever" },
  qr_step3_d: { ar: "محمية بـ PIN خاص", en: "Protected by a private PIN" },
  qr_section_cta: { ar: "اكتشف كيف تعمل", en: "See How It Works" },

  story_title: {
    ar: "قطع تُلبس… وتُورث",
    en: "Worn Today. Inherited Tomorrow.",
  },
  story_text: {
    ar: "لا نصمم للزينة وحدها، بل نحفظ نبضات اللحظات التي تستحقّ الخلود. مشاعر ليست مجوهرات… مشاعر وعدٌ يُلبَس.",
    en: "We don't craft for adornment alone — we craft to preserve the heartbeat of moments worth keeping. Mashaer isn't jewellery. It's a promise you can wear.",
  },
  value_meaning: { ar: "المعنى قبل الشكل", en: "Meaning Over Ornament" },
  value_timeless: { ar: "ذكرى خالدة", en: "Timeless Memory" },
  value_quiet: { ar: "فخامة هادئة", en: "Quiet Luxury" },

  // Product
  add_to_cart: { ar: "أضف إلى السلة", en: "Add to Cart" },
  added_to_cart: { ar: "تمت الإضافة إلى السلة", en: "Added to cart" },
  buy_now: { ar: "اشترِ الآن", en: "Buy Now" },
  out_of_stock: { ar: "غير متوفر", en: "Sold Out" },
  in_stock: { ar: "متوفر", en: "In Stock" },
  qr_eligible: { ar: "مع ذكرى QR", en: "QR Memory Included" },
  size: { ar: "المقاس", en: "Size" },
  material: { ar: "الخامة", en: "Material" },
  quantity: { ar: "الكمية", en: "Quantity" },
  description: { ar: "الوصف", en: "Description" },
  details: { ar: "التفاصيل", en: "Details" },
  shipping_info: { ar: "الشحن", en: "Shipping" },
  related: { ar: "قد يعجبك أيضًا", en: "You May Also Love" },

  // Filters
  filters: { ar: "الفلاتر", en: "Filters" },
  category: { ar: "الفئة", en: "Category" },
  price_range: { ar: "السعر", en: "Price" },
  sort_by: { ar: "ترتيب حسب", en: "Sort by" },
  sort_new: { ar: "الأحدث", en: "Newest" },
  sort_low: { ar: "السعر: من الأقل", en: "Price: Low to High" },
  sort_high: { ar: "السعر: من الأعلى", en: "Price: High to Low" },
  sort_pop: { ar: "الأكثر مبيعًا", en: "Best Sellers" },
  all: { ar: "الكل", en: "All" },
  results: { ar: "نتيجة", en: "results" },
  products_count_label: { ar: "قطعة", en: "pieces" },
  no_results: { ar: "لا توجد نتائج", en: "No results found" },
  clear_filters: { ar: "مسح الفلاتر", en: "Clear filters" },

  // Cart
  cart_title: { ar: "سلة التسوق", en: "Your Cart" },
  cart_empty: { ar: "سلتك فارغة", en: "Your cart is empty" },
  cart_empty_d: {
    ar: "ابدأ التسوق واكتشف القطع التي ستحبها",
    en: "Start exploring pieces you'll love",
  },
  cart_continue: { ar: "تابع التسوق", en: "Continue Shopping" },
  cart_subtotal: { ar: "المجموع الفرعي", en: "Subtotal" },
  cart_shipping: { ar: "الشحن", en: "Shipping" },
  cart_shipping_calc: { ar: "يُحسب عند الدفع", en: "Calculated at checkout" },
  cart_total: { ar: "الإجمالي", en: "Total" },
  cart_checkout: { ar: "إتمام الشراء", en: "Proceed to Checkout" },
  remove: { ar: "حذف", en: "Remove" },

  // Checkout
  checkout_title: { ar: "إتمام الشراء", en: "Checkout" },
  step_shipping: { ar: "الشحن", en: "Shipping" },
  step_review: { ar: "المراجعة", en: "Review" },
  step_payment: { ar: "الدفع", en: "Payment" },
  full_name: { ar: "الاسم الكامل", en: "Full Name" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  phone: { ar: "رقم الهاتف", en: "Phone Number" },
  address_line: { ar: "العنوان", en: "Address" },
  city: { ar: "المدينة", en: "City" },
  emirate: { ar: "الإمارة", en: "Emirate" },
  postal_code: { ar: "الرمز البريدي (اختياري)", en: "Postal Code (optional)" },
  notes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  qr_choice: { ar: "خيار ذكرى QR", en: "QR Memory Option" },
  qr_per_order: {
    ar: "بطاقة QR واحدة للطلب كاملاً",
    en: "One QR card for the entire order",
  },
  qr_per_piece: {
    ar: "بطاقة QR لكل قطعة على حدة",
    en: "Separate QR card per piece",
  },
  continue: { ar: "متابعة", en: "Continue" },
  back: { ar: "رجوع", en: "Back" },
  pay_now: { ar: "ادفع الآن", en: "Pay Now" },
  order_summary: { ar: "ملخص الطلب", en: "Order Summary" },
  pay_card: { ar: "بطاقة (Visa / Mastercard)", en: "Card (Visa / Mastercard)" },
  pay_apple: { ar: "Apple Pay", en: "Apple Pay" },
  pay_paypal: { ar: "PayPal", en: "PayPal" },
  pay_mock_note: {
    ar: "هذه نسخة تجريبية — لا يتم خصم أي مبلغ.",
    en: "This is a demo — no real charge will be made.",
  },

  // Confirmation
  order_confirmed: { ar: "تم تأكيد طلبك!", en: "Order Confirmed!" },
  order_confirmed_d: {
    ar: "شكرًا لك. سنرسل تفاصيل الشحن إلى بريدك الإلكتروني قريبًا.",
    en: "Thank you. We'll send shipping details to your email shortly.",
  },
  order_number: { ar: "رقم الطلب", en: "Order Number" },
  view_qr: { ar: "عرض بطاقة QR الخاصة بك", en: "View Your QR Card" },
  back_home: { ar: "العودة للرئيسية", en: "Back to Home" },

  // Memory page
  memory_title: { ar: "ذكرى محفوظة", en: "A Saved Memory" },
  memory_pin_prompt: {
    ar: "أدخل رمز PIN لعرض الذكرى",
    en: "Enter the PIN to view this memory",
  },
  memory_pin: { ar: "رمز PIN المكون من ٤ أرقام", en: "4-digit PIN" },
  unlock: { ar: "فتح", en: "Unlock" },
  wrong_pin: { ar: "رمز PIN غير صحيح", en: "Incorrect PIN" },
  setup_memory_title: { ar: "أنشئ ذكراك", en: "Create Your Memory" },
  setup_memory_d: {
    ar: "ارفع حتى ٣ صور وأضف عنوانًا ورسالة من القلب.",
    en: "Upload up to 3 photos and add a heartfelt title and message.",
  },
  upload_photos: { ar: "ارفع الصور", en: "Upload Photos" },
  memory_title_field: { ar: "عنوان الذكرى", en: "Memory Title" },
  memory_message: { ar: "الرسالة", en: "Message" },
  set_pin: { ar: "اختر رمز PIN (٤ أرقام)", en: "Choose PIN (4 digits)" },
  save_memory: { ar: "حفظ الذكرى", en: "Save Memory" },
  edit_memory: { ar: "تعديل الذكرى", en: "Edit Memory" },
  memory_saved: { ar: "تم حفظ الذكرى بنجاح", en: "Memory saved successfully" },

  // Auth (mocked)
  login: { ar: "تسجيل الدخول", en: "Login" },
  login_demo_note: {
    ar: "نسخة تجريبية — اضغط لتسجيل الدخول بحساب وهمي.",
    en: "Demo mode — click to sign in with a mock account.",
  },
  login_demo_btn: { ar: "ادخل كمستخدم تجريبي", en: "Sign in as demo user" },
  logout: { ar: "تسجيل الخروج", en: "Logout" },
  welcome_back: { ar: "أهلاً بعودتك", en: "Welcome back" },

  // Account
  my_orders: { ar: "طلباتي", en: "My Orders" },
  my_memories: { ar: "ذكرياتي", en: "My Memories" },
  my_addresses: { ar: "عناويني", en: "My Addresses" },
  my_wishlist: { ar: "قائمة المفضلة", en: "Wishlist" },
  wishlist_added: { ar: "أضيف للمفضلة", en: "Saved to wishlist" },
  wishlist_removed: { ar: "أزيل من المفضلة", en: "Removed from wishlist" },

  // Admin — sidebar / shell
  admin_title: { ar: "لوحة التحكم", en: "Admin Panel" },
  admin_dashboard: { ar: "الرئيسية", en: "Dashboard" },
  admin_subtitle: {
    ar: "أهلاً بعودتك، أيها المسؤول",
    en: "Welcome back, Admin",
  },
  admin_view_store: { ar: "عرض المتجر", en: "View Store" },
  admin_sign_out: { ar: "تسجيل الخروج", en: "Sign Out" },
  admin_signed_out: { ar: "تم تسجيل الخروج", en: "Signed out" },

  // Admin — dashboard
  admin_orders_today: { ar: "طلبات اليوم", en: "Orders Today" },
  admin_revenue_today: { ar: "إيرادات اليوم", en: "Revenue Today" },
  admin_total_orders: { ar: "إجمالي الطلبات", en: "Total Orders" },
  admin_total_revenue: { ar: "إجمالي الإيرادات", en: "Total Revenue" },
  admin_total_products: { ar: "إجمالي المنتجات", en: "Total Products" },
  admin_active_qr: { ar: "ذكريات QR مفعّلة", en: "Active QR Memories" },
  admin_new_customers: { ar: "عملاء جدد", en: "New Customers" },
  admin_recent_orders: { ar: "أحدث الطلبات", en: "Recent Orders" },
  admin_low_stock: { ar: "منتجات قليلة", en: "Low Stock" },
  admin_orders_by_status: { ar: "الطلبات حسب الحالة", en: "Orders by Status" },
  admin_orders_by_status_sub: {
    ar: "تصنيف الطلبات الحالية",
    en: "Current order breakdown",
  },
  admin_revenue_trend: { ar: "اتجاه الإيرادات", en: "Revenue Trend" },
  admin_revenue_trend_sub: {
    ar: "إيرادات شهرية بالدرهم",
    en: "Monthly revenue in AED",
  },

  // Admin — products
  admin_products_count: { ar: "منتج في الكتالوج", en: "products in catalogue" },
  admin_search_products: {
    ar: "ابحث في المنتجات...",
    en: "Search products...",
  },

  // Admin — QR codes
  admin_qr_codes: { ar: "ذكريات QR", en: "QR Memories" },
  admin_qr_pages_generated: {
    ar: "صفحة ذكرى تم إنشاؤها",
    en: "memory pages generated",
  },
  admin_qr_total_generated: {
    ar: "إجمالي ما تم إنشاؤه",
    en: "Total Generated",
  },
  admin_qr_set_up: { ar: "تم إعدادها", en: "Set Up" },
  admin_qr_pending_setup: { ar: "بانتظار الإعداد", en: "Pending Setup" },
  admin_qr_search: {
    ar: "ابحث بالعنوان أو الرمز أو المنتج...",
    en: "Search by title, slug or product...",
  },
  admin_qr_memory: { ar: "الذكرى", en: "Memory" },
  admin_qr_slug: { ar: "الرمز", en: "Slug" },
  admin_qr_photos: { ar: "الصور", en: "Photos" },
  admin_qr_created: { ar: "أُنشئت", en: "Created" },
  admin_qr_active: { ar: "مفعّلة", en: "Active" },
  admin_qr_pending: { ar: "بانتظار", en: "Pending" },
  admin_qr_no_title: { ar: "بدون عنوان", en: "Untitled memory" },
  admin_qr_no_product: { ar: "—", en: "—" },

  // Admin — orders filters
  admin_search_orders: {
    ar: "ابحث برقم الطلب...",
    en: "Search order number...",
  },
  admin_filter_all: { ar: "الكل", en: "All" },
  admin_total_orders_count: { ar: "إجمالي الطلبات", en: "total orders" },
  items: { ar: "القطع", en: "Items" },
  order: { ar: "طلب", en: "Order" },

  // Admin — settings
  admin_settings: { ar: "الإعدادات", en: "Settings" },
  admin_settings_sub: {
    ar: "إدارة إعدادات متجرك",
    en: "Manage your store configuration",
  },
  admin_tab_store: { ar: "المتجر", en: "Store" },
  admin_tab_shipping: { ar: "الشحن", en: "Shipping" },

  admin_store_info: { ar: "معلومات المتجر", en: "Store Information" },
  admin_contact_email: { ar: "بريد التواصل", en: "Contact Email" },
  admin_phone: { ar: "رقم الهاتف", en: "Phone Number" },
  admin_whatsapp: { ar: "رقم واتساب", en: "WhatsApp Number" },
  admin_instagram: { ar: "حساب إنستغرام", en: "Instagram Handle" },
  admin_facebook: { ar: "حساب فيسبوك", en: "Facebook Handle" },
  admin_save_store: { ar: "حفظ إعدادات المتجر", en: "Save Store Settings" },

  admin_shipping_rates: {
    ar: "أسعار الشحن (درهم)",
    en: "Shipping Rates (AED)",
  },
  admin_shipping_dubai: { ar: "دبي", en: "Dubai" },
  admin_shipping_abudhabi: { ar: "أبوظبي", en: "Abu Dhabi" },
  admin_shipping_sharjah: { ar: "الشارقة", en: "Sharjah" },
  admin_shipping_ajman: { ar: "عجمان", en: "Ajman" },
  admin_shipping_uaq: { ar: "أم القيوين", en: "Umm Al Quwain" },
  admin_shipping_rak: { ar: "رأس الخيمة", en: "Ras Al Khaimah" },
  admin_shipping_fujairah: { ar: "الفجيرة", en: "Fujairah" },
  admin_aed: { ar: "درهم", en: "AED" },
  admin_save_shipping: {
    ar: "حفظ إعدادات الشحن",
    en: "Save Shipping Settings",
  },

  admin_settings_saved: { ar: "تم حفظ الإعدادات", en: "Settings saved" },
  add_product: { ar: "إضافة منتج", en: "Add Product" },
  product_name: { ar: "اسم المنتج", en: "Product Name" },
  product_price: { ar: "السعر", en: "Price" },
  product_status: { ar: "الحالة", en: "Status" },
  edit: { ar: "تعديل", en: "Edit" },
  delete: { ar: "حذف", en: "Delete" },
  active: { ar: "نشط", en: "Active" },
  inactive: { ar: "غير نشط", en: "Inactive" },
  status: { ar: "الحالة", en: "Status" },
  customer: { ar: "العميل", en: "Customer" },
  date: { ar: "التاريخ", en: "Date" },
  total: { ar: "الإجمالي", en: "Total" },
  actions: { ar: "إجراءات", en: "Actions" },
  view: { ar: "عرض", en: "View" },
  update_status: { ar: "تحديث الحالة", en: "Update Status" },
  status_pending: { ar: "قيد الانتظار", en: "Pending" },
  status_paid: { ar: "مدفوع", en: "Paid" },
  status_processing: { ar: "قيد التجهيز", en: "Processing" },
  status_shipped: { ar: "تم الشحن", en: "Shipped" },
  status_delivered: { ar: "تم التسليم", en: "Delivered" },
  status_cancelled: { ar: "ملغى", en: "Cancelled" },

  // Footer
  footer_about: { ar: "عن مشاعر", en: "About Mashaer" },
  footer_about_d: {
    ar: "مجوهرات تنبض بالمشاعر. مصاغة بأناقة هادئة، لتحمل أغلى لحظاتكِ إلى الأبد.",
    en: "Jewellery that carries feeling. Crafted with quiet elegance to hold your most precious moments — forever.",
  },
  footer_shop: { ar: "تسوق", en: "Shop" },
  footer_help: { ar: "مساعدة", en: "Help" },
  footer_contact: { ar: "تواصل", en: "Get in Touch" },
  footer_rights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  footer_newsletter: { ar: "اشترك في النشرة", en: "Join the Story" },
  footer_newsletter_d: {
    ar: "كوني أول من تعرف عن المجموعات الجديدة.",
    en: "Be first to know about new collections.",
  },
  subscribe: { ar: "اشترك", en: "Subscribe" },

  // About
  about_title: { ar: "قصتنا", en: "Our Story" },
  about_mission_eyebrow: { ar: "مهمتنا", en: "Our Mission" },
  about_intro: {
    ar: "في مشاعر، نبتكر مجوهراتٍ فاخرةً للأطفال تحمل معنىً عاطفياً عميقاً — قطعٌ ترتبط بأحجار الميلاد، والقصص، والذكريات الرقمية المحمية — لتبقى أجمل اللحظات حيّةً إلى الأبد.",
    en: "At Mashaer, we craft luxurious children's jewellery enriched with profound emotional meaning — pieces woven with birthstones, personal stories, and securely protected digital memories — so life's most precious moments live on, forever.",
  },

  // Contact
  contact_title: { ar: "تواصلي معنا", en: "Get in Touch" },
  contact_sub: {
    ar: "نحن هنا للإجابة على كل أسئلتك",
    en: "We're here for every question",
  },
  message: { ar: "الرسالة", en: "Message" },
  send: { ar: "إرسال", en: "Send Message" },
  message_sent: {
    ar: "تم إرسال رسالتك. شكرًا لك!",
    en: "Message sent. Thank you!",
  },

  // Misc
  language: { ar: "Language", en: "اللغة" },
  search_placeholder: { ar: "ابحث عن قطعة…", en: "Search for a piece…" },
  back_to_top: { ar: "للأعلى", en: "Back to top" },
  whatsapp_us: { ar: "تواصل عبر واتساب", en: "Chat on WhatsApp" },
  loading: { ar: "جارٍ التحميل…", en: "Loading…" },
  currency: { ar: "د.إ", en: "AED" },

  // Categories
  cat_rings: { ar: "خواتم", en: "Rings" },
  cat_necklaces: { ar: "قلائد", en: "Necklaces" },
  cat_bracelets: { ar: "أساور", en: "Bracelets" },
  cat_earrings: { ar: "أقراط", en: "Earrings" },
  cat_baby: { ar: "مجوهرات الأطفال", en: "Baby Pieces" },

  // Policies
  policies_title: { ar: "السياسات", en: "Policies" },
  policy_shipping: { ar: "الشحن والتوصيل", en: "Shipping & Delivery" },
  policy_returns: { ar: "الإرجاع والاستبدال", en: "Returns & Exchanges" },
  policy_privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  policy_terms: { ar: "الشروط والأحكام", en: "Terms of Service" },

  // Final CTA band (Home + About)
  cta_ready_eyebrow: { ar: "ابدئي قصتك", en: "Start your story" },
  cta_ready_title: {
    ar: "جاهزة لصنع ذكرى؟",
    en: "Ready to Create a Memory?",
  },
  cta_ready_sub: {
    ar: "اختاري قطعة، وأرفقي بها لحظة. هكذا تُولد المشاعر الخالدة.",
    en: "Pick a piece, attach a moment. That's how stories begin.",
  },
  cta_ready_btn: { ar: "تسوّقي الآن", en: "Shop Now" },
  cta_about_eyebrow: { ar: "كوني جزءًا من مشاعرنا", en: "Join the feeling" },
  cta_about_title: {
    ar: "كوني جزءًا من مشاعرنا",
    en: "Be Part of the Feeling",
  },
  cta_about_sub: {
    ar: "اكتشفي مجموعتنا واختاري القطعة التي تحمل ذكراكِ الأغلى.",
    en: "Explore our collection and find the perfect piece to carry your family's most precious memory.",
  },

  // PDP — age, material, tabs
  pdp_age: { ar: "العمر المناسب", en: "Suitable Age" },
  pdp_material: { ar: "الخامة", en: "Material" },
  pdp_material_default: { ar: "ذهب 18 قيراط", en: "18k Gold" },
  pdp_tab_description: { ar: "الوصف", en: "Description" },
  pdp_tab_shipping: { ar: "الشحن", en: "Shipping" },
  pdp_tab_care: { ar: "العناية", en: "Jewellery Care" },
  pdp_shipping_copy: {
    ar: "التوصيل داخل الإمارات خلال 2-4 أيام عمل، وتحتسب رسوم الشحن حسب الإمارة عند إتمام الطلب.",
    en: "Delivered within the UAE in 2-4 business days · shipping is calculated by emirate at checkout.",
  },
  pdp_care_copy: {
    ar: "خزّني القطعة في الكيس المخمل المرفق، وامسحيها بقطعة قماش ناعمة. تجنّبي العطور والكلور والاحتكاك المباشر.",
    en: "Store in the included velvet pouch and wipe with a soft, lint-free cloth. Avoid perfumes, chlorine and direct friction to preserve the gold finish.",
  },

  // Contact additions
  contact_topic_label: { ar: "موضوع الرسالة", en: "Topic" },
  contact_topic_order: { ar: "استفسار عن طلب", en: "Order Inquiry" },
  contact_topic_qr: { ar: "ذاكرة QR", en: "QR Memory" },
  contact_topic_custom: { ar: "طلب خاص", en: "Custom Order" },
  contact_topic_general: { ar: "استفسار عام", en: "General" },
  contact_topic_other: { ar: "أخرى", en: "Other" },
  contact_whatsapp_title: {
    ar: "تحدّثي معنا على واتساب",
    en: "Chat on WhatsApp",
  },
  contact_whatsapp_sub: {
    ar: "نرد عادةً خلال دقائق",
    en: "Typically replies within minutes",
  },
  contact_whatsapp_btn: { ar: "ابدئي المحادثة", en: "Start Chat" },
  contact_showroom_title: { ar: "صالة العرض", en: "Visit Our Showroom" },
  contact_showroom_addr: {
    ar: "حي دبي للتصميم (d3)، دبي، الإمارات",
    en: "Dubai Design District (d3), Dubai, UAE",
  },
  contact_faq_title: { ar: "أسئلة شائعة", en: "Frequently Asked" },
  contact_faq_q1: {
    ar: "كيف تعمل ذاكرة QR؟",
    en: "How does the QR Memory work?",
  },
  contact_faq_a1: {
    ar: "كل قطعة مؤهلة تأتي ببطاقة QR خاصة. امسحي الرمز لفتح صفحة محمية بـ PIN فيها صور وكلمات وقصص يحفظها صاحب القطعة.",
    en: "Every eligible piece ships with a private QR card. Scan it to open a PIN-protected page where the owner saves photos, notes and the story behind the piece.",
  },
  contact_faq_q2: {
    ar: "هل قطع الأطفال آمنة؟",
    en: "Are the children's pieces safe?",
  },
  contact_faq_a2: {
    ar: "نعم — جميع القطع المخصصة للأطفال مصنوعة من ذهب 18 قيراط بدون لحامات حادة، وتمر بفحوصات سلامة قبل الشحن.",
    en: "Yes — all baby pieces are crafted from 18k gold with no sharp solder points, and pass safety checks before shipping.",
  },
  contact_faq_q3: {
    ar: "هل تشحنون خارج الإمارات؟",
    en: "Do you ship outside the UAE?",
  },
  contact_faq_a3: {
    ar: "نعم — نشحن إلى دول مجلس التعاون الخليجي (السعودية، الكويت، قطر، البحرين، عُمان) خلال 4-7 أيام عمل.",
    en: "Yes — we ship to all GCC countries (KSA, Kuwait, Qatar, Bahrain, Oman) within 4-7 business days.",
  },
  contact_faq_q4: {
    ar: "هل يمكنني طلب تصميم خاص؟",
    en: "Can I request a custom design?",
  },
  contact_faq_a4: {
    ar: "بالتأكيد. اختاري «طلب خاص» في الموضوع أعلاه أو راسلينا على واتساب وسنبدأ معكِ التصميم خطوة بخطوة.",
    en: 'Absolutely. Select "Custom Order" as the topic above or reach us on WhatsApp — we\'ll guide you piece-by-piece.',
  },
  message_counter: { ar: "حرف", en: "characters" },

  // About restyle
  about_eyebrow: { ar: "قصتنا", en: "Our Story" },
  about_hero_l1: { ar: "أكثر من مجوهرات.", en: "More Than Jewellery." },
  about_hero_l2: { ar: "إرث يُورث.", en: "A Legacy." },
  about_hero_sub: {
    ar: "نصمم قطعًا تحمل المعنى، تحفظ اللحظة، وتنتقل بين الأجيال — ليست مجرد زينة بل ذاكرة تُلبس.",
    en: "We craft pieces that hold meaning, preserve a moment, and move from one generation to the next — not ornament, but memory you can wear.",
  },
  about_values_eyebrow: { ar: "ما يقودنا", en: "What Guides Us" },
  about_values_title: { ar: "قيمنا", en: "Our Values" },
  value_crafted: { ar: "مصنوع بحب", en: "Crafted With Love" },
  value_crafted_d: {
    ar: "كل قطعة تُصاغ يدويًا بإتقان واهتمام بأدق التفاصيل.",
    en: "Every piece is hand-finished with obsessive attention to the smallest details.",
  },
  value_quality: { ar: "جودة استثنائية", en: "Exceptional Quality" },
  value_quality_d: {
    ar: "ذهب 18 قيراط وأحجار طبيعية مختارة، نضمن أن تدوم.",
    en: "18k gold and ethically-sourced natural stones — built to last.",
  },
  value_safe: { ar: "آمن للأطفال", en: "Child Safe" },
  value_safe_d: {
    ar: "كل قطع الأطفال خالية من اللحامات الحادة وتجتاز فحوصات السلامة.",
    en: "All children's pieces are smooth-finished and pass strict safety checks.",
  },
  value_heirloom: { ar: "إرث حيّ", en: "Living Heirlooms" },
  value_heirloom_d: {
    ar: "كل قطعة تأتي بذاكرة QR لتنتقل قصتها مع كل جيل.",
    en: "Every piece carries a QR memory so its story travels with every generation.",
  },

  // Account / Overview
  account_overview: { ar: "نظرة عامة", en: "Overview" },
  account_stat_orders: { ar: "إجمالي الطلبات", en: "Total Orders" },
  account_stat_items: { ar: "القطع المُشتراة", en: "Items Purchased" },
  account_stat_memories: { ar: "ذكريات QR", en: "QR Memories" },
  account_stat_wishlist: { ar: "المفضلة", en: "Wishlist" },
  account_recent_orders: { ar: "آخر الطلبات", en: "Recent Orders" },
  account_quick_shop: { ar: "تسوّقي الآن", en: "Shop Now" },
  account_quick_memories: { ar: "ذكرياتي", en: "My Memories" },
  account_quick_addresses: { ar: "إدارة العناوين", en: "Manage Addresses" },

  // My Memories route
  my_memories_eyebrow: { ar: "ذكرياتك", en: "Your Keepsakes" },
  my_memories_title: { ar: "ذكريات QR الخاصة بي", en: "My QR Memories" },
  my_memories_new: { ar: "إنشاء QR جديد", en: "Generate New QR" },
  my_memories_empty: {
    ar: "لم تُنشئي أي ذكرى بعد — اشتري قطعة مؤهلة ثم امسحي بطاقة QR لتبدئي.",
    en: "You haven't created any memories yet — buy a QR-eligible piece, then scan its card to start.",
  },
  my_memories_status_active: { ar: "نشطة", en: "Active" },
  memory_pin_label: { ar: "PIN", en: "PIN" },
  memory_view: { ar: "عرض", en: "View" },
  memory_edit: { ar: "تعديل", en: "Edit" },
  memory_linked_product: { ar: "مرتبطة بـ", en: "Linked to" },
  memory_created_on: { ar: "أُنشئت الذكرى", en: "Memory created" },
  memory_jewellery_piece: { ar: "القطعة", en: "Jewellery piece" },
  memory_prev_photo: { ar: "السابقة", en: "Previous photo" },
  memory_next_photo: { ar: "التالية", en: "Next photo" },

  // Admin QR PIN reset
  admin_qr_reset_pin: { ar: "إعادة تعيين PIN", en: "Reset PIN" },
  admin_qr_reset_pin_prompt: {
    ar: "أدخل PIN جديد مكوّن من 4 أرقام",
    en: "Enter a new 4-digit PIN",
  },
  admin_qr_reset_pin_done: {
    ar: "تمت إعادة تعيين PIN",
    en: "PIN reset successfully",
  },
  admin_qr_delete_memory: { ar: "حذف الذكرى", en: "Delete memory" },
  admin_qr_delete_confirm: {
    ar: "حذف هذه الذكرى نهائيًا؟",
    en: "Delete this memory permanently?",
  },
  admin_qr_no_memory: { ar: "لم تُنشأ بعد", en: "Not set up yet" },
  admin_qr_clean_orphans: {
    ar: "تنظيف الصور اليتيمة",
    en: "Clean orphan photos",
  },
  admin_qr_clean_orphans_confirm: {
    ar: "حذف كل صورة غير مرتبطة بأي ذكرى محفوظة؟ لا يمكن التراجع.",
    en: "Delete every photo not linked to a saved memory? This can't be undone.",
  },
  admin_qr_clean_orphans_none: {
    ar: "لا توجد صور يتيمة",
    en: "No orphan photos found",
  },

  // Footer WhatsApp
  footer_whatsapp_label: { ar: "واتساب", en: "WhatsApp" },
} as const;

export type TKey = keyof typeof translations;

export function t(key: TKey, locale: Locale): string {
  return translations[key][locale];
}

export const dirOf = (locale: Locale): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";
