/**
 * Fictional Seed Dataset for ShopNest Ethiopia
 * Strictly designated as demonstration data.
 * Prices denominated in Ethiopian Birr (ETB).
 */

export interface SeedCategory {
  name: string;
  nameAmharic: string;
  slug: string;
  description: string;
  image: string;
}

export interface SeedProduct {
  title: string;
  titleAmharic: string;
  slug: string;
  description: string;
  descriptionAmharic: string;
  price: number; // in ETB
  discountPrice?: number; // in ETB
  categorySlug: string;
  stock: number;
  sku: string;
  images: string[];
  attributes: Record<string, string>;
}

export interface SeedCustomer {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: {
    fullName: string;
    phone: string;
    city: string;
    subCity?: string;
    woreda?: string;
    houseNumber?: string;
    landmark?: string;
    isDefault: boolean;
  };
}

export interface SeedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDaysFromNow: number;
  usageLimit: number;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: 'Electronics',
    nameAmharic: 'ኤሌክትሮኒክስ',
    slug: 'electronics',
    description: 'High-definition TVs, premium audio systems, smart home devices, and power accessories.',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Phones & Accessories',
    nameAmharic: 'ስልኮች እና መለዋወጫዎች',
    slug: 'phones-accessories',
    description: 'Latest smartphones, wireless chargers, rugged cases, screen protectors, and power banks.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Computers & Office',
    nameAmharic: 'ኮምፒውተሮች እና ቢሮ',
    slug: 'computers',
    description: 'High-performance laptops, mechanical keyboards, ergonomic monitors, and office supplies.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fashion & Traditional Wear',
    nameAmharic: 'ፋሽን እና ባህላዊ አልባሳት',
    slug: 'fashion',
    description: 'Authentic handcrafted Habesha Kemis, modern leather shoes, stylish jackets, and accessories.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Home & Kitchen',
    nameAmharic: 'የቤት እና የወጥ ቤት እቃዎች',
    slug: 'home-kitchen',
    description: 'Clay coffee Jebenas, electric Mitad griddles, blenders, espresso machines, and cookware.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Beauty & Personal Care',
    nameAmharic: 'ውበት እና የግል እንክብካቤ',
    slug: 'beauty-personal-care',
    description: 'Organic Ethiopian black seed oils, skincare essentials, natural hair care, and fragrances.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Books & Stationery',
    nameAmharic: 'መጽሐፍት እና የጽህፈት መሳሪያዎች',
    slug: 'books-stationery',
    description: 'Ethiopian history literature, Amharic poetry, educational materials, and premium notebooks.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sports & Outdoor Products',
    nameAmharic: 'ስፖርት እና የውጪ እንቅስቃሴ',
    slug: 'sports-outdoors',
    description: 'Professional distance running shoes, fitness trackers, resistance bands, and camping gear.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  // --- Category 1: Electronics (4 items) ---
  {
    title: 'Smart 4K Ultra HD 55-inch LED TV',
    titleAmharic: 'ስማርት 4K አልትራ ኤችዲ 55 ኢንች ቴሌቪዥን',
    slug: 'smart-4k-ultra-hd-55-inch-led-tv',
    description: 'Crystal clear 4K visuals with built-in YouTube, Netflix, and Bluetooth 5.2 connectivity.',
    descriptionAmharic: 'ግልጽ የ 4K እይታ ከዩቲዩብ እና ኔትፍሊክስ አብሮ የተሰራ መተግበሪያዎች ጋር።',
    price: 38500,
    discountPrice: 34999,
    categorySlug: 'electronics',
    stock: 12,
    sku: 'SNE-ELC-001',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80'],
    attributes: { ScreenSize: '55 inch', Resolution: '3840x2160', Warranty: '2 Years' },
  },
  {
    title: 'Active Noise Cancelling Wireless Headphones',
    titleAmharic: 'ድምፅ የማያሳልፍ ገመድ አልባ የጆሮ ማዳመጫ',
    slug: 'active-noise-cancelling-wireless-headphones',
    description: 'Industry-leading noise cancellation with 40-hour battery life and ultra-comfortable ear cushions.',
    descriptionAmharic: 'የውጭ ድምፅን ሙሉ በሙሉ የሚከላከል፣ ለ 40 ሰዓታት የሚያገለግል ባትሪ ያለው።',
    price: 5200,
    discountPrice: 4650,
    categorySlug: 'electronics',
    stock: 25,
    sku: 'SNE-ELC-002',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    attributes: { BatteryLife: '40 Hours', Connectivity: 'Bluetooth 5.3', Color: 'Matte Charcoal' },
  },
  {
    title: 'Portable Bluetooth Waterproof Outdoor Speaker',
    titleAmharic: 'ውሃ የማያበላሸው ተንቀሳቃሽ የብሉቱዝ ስፒከር',
    slug: 'portable-bluetooth-waterproof-outdoor-speaker',
    description: 'Rugged IPX7 waterproof speaker delivering deep bass and 15-hour playback for outdoor gatherings.',
    descriptionAmharic: 'ለጉዞ እና ለመዝናኛ የሚሆን ጥራት ያለው ጥልቅ ባስ ድምፅ የሚያወጣ።',
    price: 3200,
    categorySlug: 'electronics',
    stock: 4, // Low stock demo
    sku: 'SNE-ELC-003',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
    attributes: { WaterResistance: 'IPX7', Playback: '15 Hours', Power: '30W' },
  },
  {
    title: 'Heavy-Duty 20000mAh Fast Charging Power Bank',
    titleAmharic: '20,000mAh ፈጣን ኃይል መሙያ ፓወር ባንክ',
    slug: 'heavy-duty-20000mah-fast-charging-power-bank',
    description: 'High-capacity dual USB-C power bank compatible with all major smartphones and tablets.',
    descriptionAmharic: 'ለረጅም ጊዜ የሚያገለግል 20,000 ሚሊአምፔር ፈጣን የኃይል መሙያ።',
    price: 2450,
    discountPrice: 2150,
    categorySlug: 'electronics',
    stock: 45,
    sku: 'SNE-ELC-004',
    images: ['https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80'],
    attributes: { Capacity: '20000mAh', Output: '22.5W Fast Charge', Ports: '2 USB-A + 1 USB-C' },
  },

  // --- Category 2: Phones & Accessories (4 items) ---
  {
    title: 'Pro Dual-SIM 5G Smartphone 256GB',
    titleAmharic: 'ፕሮ ሁለት ሲም 5ጂ ስማርት ስልክ 256ጂቢ',
    slug: 'pro-dual-sim-5g-smartphone-256gb',
    description: 'Next-gen performance with 120Hz AMOLED display, 108MP camera, and all-day 5000mAh battery.',
    descriptionAmharic: '108 ሜጋፒክሰል ካሜራ እና 120ኸርዝ ስክሪን ያለው ዘመናዊ 5ጂ ስማርትፎን።',
    price: 49500,
    discountPrice: 45900,
    categorySlug: 'phones-accessories',
    stock: 8,
    sku: 'SNE-PHN-001',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'],
    attributes: { Storage: '256GB', RAM: '8GB', Network: '5G / 4G LTE' },
  },
  {
    title: 'Slim Fit Shockproof Silicone Case',
    titleAmharic: 'ቀጭን እና ጠንካራ የሲሊኮን ስልክ መከላከያ',
    slug: 'slim-fit-shockproof-silicone-case',
    description: 'Precision engineered soft-touch silicone case offering 360-degree corner drop protection.',
    descriptionAmharic: 'ስልክ ከመውደቅ እና ከመሰበር የሚከላከል ጥራት ያለው የሲሊኮን ካቨር።',
    price: 450,
    categorySlug: 'phones-accessories',
    stock: 80,
    sku: 'SNE-PHN-002',
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'],
    attributes: { Material: 'Liquid Silicone', Compatibility: 'Universal 6.5-6.7 inch' },
  },
  {
    title: '15W Fast Wireless Magnetic Charging Stand',
    titleAmharic: '15 ዋት ፈጣን ማግኔቲክ ገመድ አልባ ቻርጀር',
    slug: '15w-fast-wireless-magnetic-charging-stand',
    description: 'Convenient desktop magnetic charging stand supporting vertical and horizontal view angles.',
    descriptionAmharic: 'ስልክን በጠረጴዛ ላይ በቀላሉ አስቀምጦ ቻርጅ የሚያደርግ ማግኔቲክ ስታንድ።',
    price: 1850,
    discountPrice: 1599,
    categorySlug: 'phones-accessories',
    stock: 18,
    sku: 'SNE-PHN-003',
    images: ['https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80'],
    attributes: { Wattage: '15W Max', Alignment: 'Magnetic Lock' },
  },
  {
    title: 'Tempered Glass Screen Protector 2-Pack',
    titleAmharic: 'የስክሪን መከላከያ መስታወት (2 በአንድ ላይ)',
    slug: 'tempered-glass-screen-protector-2-pack',
    description: '9H hardness ultra-clear tempered glass with anti-scratch and oleophobic anti-fingerprint coating.',
    descriptionAmharic: '9H ጥንካሬ ያለው ጭረት የማይዝ ስክሪን ፕሮቴክተር።',
    price: 350,
    categorySlug: 'phones-accessories',
    stock: 120,
    sku: 'SNE-PHN-004',
    images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80'],
    attributes: { Hardness: '9H Tempered Glass', Pack: '2 Units' },
  },

  // --- Category 3: Computers & Office (4 items) ---
  {
    title: 'Ultra-Slim 14-inch Intel Core i7 Laptop 16GB RAM',
    titleAmharic: 'ቀጭን 14 ኢንች ኮር አይ7 ላፕቶፕ 16ጂቢ ራም',
    slug: 'ultra-slim-14-inch-intel-core-i7-laptop',
    description: 'Blazing-fast performance for software engineers, designers, and students with 512GB NVMe SSD.',
    descriptionAmharic: 'ለሶፍትዌር መሃንዲሶች እና ለቢሮ ስራ ተስማሚ ኃይለኛ ላፕቶፕ።',
    price: 68500,
    discountPrice: 63900,
    categorySlug: 'computers',
    stock: 5, // Low stock demo
    sku: 'SNE-CMP-001',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'],
    attributes: { Processor: 'Intel Core i7 13th Gen', RAM: '16GB DDR5', Storage: '512GB SSD' },
  },
  {
    title: 'Ergonomic Wireless Keyboard and Silent Mouse Combo',
    titleAmharic: 'ድምፅ አልባ ገመድ አልባ ኪቦርድ እና ማውዝ',
    slug: 'ergonomic-wireless-keyboard-mouse-combo',
    description: 'Full-sized Ethiopian Amharic & English layout keyboard with whisper-quiet keys.',
    descriptionAmharic: 'የአማርኛ እና የእንግሊዝኛ ፊደላት ያሉት ፀጥታ የሰፈነበት ኪቦርድ።',
    price: 2600,
    categorySlug: 'computers',
    stock: 30,
    sku: 'SNE-CMP-002',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
    attributes: { Connectivity: '2.4GHz USB Dongle', Battery: 'AA/AAA Included' },
  },
  {
    title: '27-inch 4K IPS Ergonomic Monitor',
    titleAmharic: '27 ኢንች 4K አይፒኤስ የኮምፒውተር ሞኒተር',
    slug: '27-inch-4k-ips-ergonomic-monitor',
    description: '99% sRGB color accuracy, height-adjustable stand, USB-C 65W charging input for clean desk setups.',
    descriptionAmharic: 'ለግራፊክስ እና ለኮዲንግ የሚሆን እጅግ ጥራት ያለው 27 ኢንች ስክሪን።',
    price: 28500,
    discountPrice: 26000,
    categorySlug: 'computers',
    stock: 9,
    sku: 'SNE-CMP-003',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'],
    attributes: { Resolution: '3840 x 2160', PanelType: 'IPS', RefreshRate: '75Hz' },
  },
  {
    title: 'USB-C 8-in-1 Aluminum Multi-Port Adapter Hub',
    titleAmharic: '8 በአንድ የአሉሚኒየም ዩኤስቢ-ሲ አስማሚ',
    slug: 'usb-c-8-in-1-aluminum-multi-port-adapter',
    description: 'Expands your laptop with 4K HDMI, 3x USB 3.0, SD Card Reader, and 100W Power Delivery.',
    descriptionAmharic: 'ኤችዲኤምአይ፣ ኤስዲ ካርድ እና ዩኤስቢ ፖርቶች የያዘ ሁለገብ አስማሚ።',
    price: 1950,
    categorySlug: 'computers',
    stock: 40,
    sku: 'SNE-CMP-004',
    images: ['https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80'],
    attributes: { Ports: 'HDMI 4K, 3x USB 3.0, SD, MicroSD, 100W PD' },
  },

  // --- Category 4: Fashion & Traditional Wear (4 items) ---
  {
    title: 'Authentic Handwoven Ethiopian Habesha Kemis',
    titleAmharic: 'በእጅ የተሸመነ ባህላዊ የሐበሻ ቀሚስ',
    slug: 'authentic-handwoven-ethiopian-habesha-kemis',
    description: 'Handcrafted pure cotton dress with exquisite Tibeb embroidery along the neckline and hemline.',
    descriptionAmharic: 'ከጥጥ በእጅ የተሸመነ በውብ ጥልፍ ያሸበረቀ ባህላዊ የሐበሻ ልብስ።',
    price: 7800,
    discountPrice: 6950,
    categorySlug: 'fashion',
    stock: 14,
    sku: 'SNE-FAS-001',
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'],
    attributes: { Fabric: '100% Ethiopian Handwoven Cotton', Embroidery: 'Handcrafted Tibeb' },
  },
  {
    title: 'Handcrafted Ethiopian Genuine Leather Backpack',
    titleAmharic: 'ከእውነተኛ የኢትዮጵያ ቆዳ የተሰራ ቦርሳ',
    slug: 'handcrafted-ethiopian-genuine-leather-backpack',
    description: 'Full-grain Ethiopian Highland sheepskin leather backpack crafted by artisans in Addis Ababa.',
    descriptionAmharic: 'ከጥራት ካለው የሃገር ውስጥ ቆዳ የተሰራ ዘላቂ የጀርባ ቦርሳ።',
    price: 4800,
    discountPrice: 4200,
    categorySlug: 'fashion',
    stock: 18,
    sku: 'SNE-FAS-002',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'],
    attributes: { LeatherType: 'Full-Grain Highland Sheepskin', Capacity: '15.6 inch Laptop' },
  },
  {
    title: 'Men Traditional Embroidered Gabi',
    titleAmharic: 'ባህላዊ የወንዶች ጋቢ',
    slug: 'men-traditional-embroidered-gabi',
    description: 'Four-layered warm Ethiopian cotton blanket (Gabi) with gold and red traditional borders.',
    descriptionAmharic: 'አራት ድርብ የሆነ ለብርድ የሚሆን ሞቅ ያለ ባህላዊ ጋቢ።',
    price: 3600,
    categorySlug: 'fashion',
    stock: 22,
    sku: 'SNE-FAS-003',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'],
    attributes: { Material: 'Pure Shemma Cotton', Border: 'Ethiopian Flag Colorway' },
  },
  {
    title: 'Handmade Ethiopian Leather Oxford Shoes',
    titleAmharic: 'በእጅ የተሰሩ የወንዶች የቆዳ ጫማዎች',
    slug: 'handmade-ethiopian-leather-oxford-shoes',
    description: 'Formal dress shoes tailored from supple Ethiopian cowhide with durable rubber soles.',
    descriptionAmharic: 'ምቾት ያለው ለስራ እና ለዝግጅት የሚሆን የቆዳ ጫማ።',
    price: 3900,
    discountPrice: 3450,
    categorySlug: 'fashion',
    stock: 16,
    sku: 'SNE-FAS-004',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'],
    attributes: { Upper: 'Ethiopian Cowhide', Sole: 'Anti-slip Rubber', Size: '40-44' },
  },

  // --- Category 5: Home & Kitchen (4 items) ---
  {
    title: 'Authentic Traditional Clay Coffee Jebena Set',
    titleAmharic: 'ባህላዊ የሸክላ ጀበና እና የሲኒ ስብስብ',
    slug: 'authentic-traditional-clay-coffee-jebena-set',
    description: 'Handmade clay Jebena accompanied by 6 matching porcelain Sini cups and brass incense burner.',
    descriptionAmharic: 'ለቡና ቁርስ የሚሆን ባህላዊ የሸክላ ጀበና ከ 6 ሲኒዎች ጋር።',
    price: 1850,
    discountPrice: 1550,
    categorySlug: 'home-kitchen',
    stock: 35,
    sku: 'SNE-HOM-001',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
    attributes: { Material: 'Natural River Clay & Porcelain', Pieces: 'Jebena + 6 Cups' },
  },
  {
    title: 'Electric Non-Stick Injera Mitad 50cm',
    titleAmharic: 'ዘመናዊ የኤሌክትሪክ የእንጀራ ምጣድ 50 ሳ.ሜ',
    slug: 'electric-non-stick-injera-mitad-50cm',
    description: 'Energy-saving electric griddle designed specifically for uniform heat and fluffy injera eyes.',
    descriptionAmharic: 'ሃይል ቆጣቢ የሆነ እንጀራ የሚያሳምር ዘመናዊ የኤሌክትሪክ ምጣድ።',
    price: 12500,
    discountPrice: 11200,
    categorySlug: 'home-kitchen',
    stock: 6,
    sku: 'SNE-HOM-002',
    images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'],
    attributes: { Diameter: '50cm', Power: '3000W', Voltage: '220V' },
  },
  {
    title: 'Heavy Duty 2-in-1 Countertop Food Blender',
    titleAmharic: 'ከፍተኛ ኃይል ያለው የፍራፍሬ እና ቅመም መፍጫ',
    slug: 'heavy-duty-2-in-1-countertop-blender',
    description: 'Stainless steel 6-blade blender capable of crushing ice and grinding Ethiopian spices and coffee.',
    descriptionAmharic: 'በረዶ እና ቡና መፍጨት የሚችል ጠንካራ ብሌንደር።',
    price: 3800,
    categorySlug: 'home-kitchen',
    stock: 20,
    sku: 'SNE-HOM-003',
    images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80'],
    attributes: { Motor: '1200W', Capacity: '1.8 Liters', Jar: 'BPA-Free Tritan' },
  },
  {
    title: 'Stainless Steel Double-Wall Thermal Coffee Carafe 2L',
    titleAmharic: 'ሙቀት ጠባቂ የቡና እና ሻይ ቴርሞስ 2 ሊትር',
    slug: 'stainless-steel-thermal-coffee-carafe-2l',
    description: 'Keeps brewed Ethiopian coffee or spiced tea piping hot for over 24 hours.',
    descriptionAmharic: 'ቡና እና ሻይ እንዳይቀዘቅዝ ለ 24 ሰዓት ሙቀት የሚጠብቅ ቴርሞስ።',
    price: 1450,
    categorySlug: 'home-kitchen',
    stock: 3, // Low stock demo
    sku: 'SNE-HOM-004',
    images: ['https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'],
    attributes: { Capacity: '2.0 Liters', Insulation: 'Vacuum Double Wall' },
  },

  // --- Category 6: Beauty & Personal Care (4 items) ---
  {
    title: 'Pure Organic Ethiopian Black Seed Oil 250ml',
    titleAmharic: 'ንፁህ የተፈጥሮ የጥቁር አዝሙድ ዘይት 250ሚ.ሊ',
    slug: 'pure-organic-ethiopian-black-seed-oil-250ml',
    description: 'Cold-pressed Nigella Sativa oil from Gondar, renowned for immunity, skin glow, and hair vitality.',
    descriptionAmharic: 'ከጎንደር ጥቁር አዝሙድ በቀዝቃዛ መንገድ የተጨመቀ የተፈጥሮ ዘይት።',
    price: 850,
    discountPrice: 720,
    categorySlug: 'beauty-personal-care',
    stock: 50,
    sku: 'SNE-BEA-001',
    images: ['https://images.unsplash.com/photo-1608248597359-bb5e718b53db?auto=format&fit=crop&w=800&q=80'],
    attributes: { Volume: '250ml', Extraction: '100% Cold-Pressed', Origin: 'Gondar, Ethiopia' },
  },
  {
    title: 'Natural Raw Shea Butter & Cocoa Body Cream',
    titleAmharic: 'የተፈጥሮ የሺአ ቅቤ እና የሰውነት ማለስለሻ',
    slug: 'natural-raw-shea-butter-cocoa-body-cream',
    description: 'Intense 48-hour moisture therapy enriched with vitamin E for dry and sensitive skin.',
    descriptionAmharic: 'ቆዳን የሚያለሰልስ እና ድርቀትን የሚከላከል የሰውነት ቅባት።',
    price: 650,
    categorySlug: 'beauty-personal-care',
    stock: 40,
    sku: 'SNE-BEA-002',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
    attributes: { Size: '200g', SkinType: 'All Skin Types' },
  },
  {
    title: 'Organic Herbal Rosemary & Moringa Hair Growth Serum',
    titleAmharic: 'የሮዝመሪ እና ሞሪንጋ የተፈጥሮ የፀጉር ማሳደጊያ',
    slug: 'organic-herbal-rosemary-moringa-hair-growth-serum',
    description: 'Strengthens hair roots, stimulates scalp circulation, and prevents dandruff naturally.',
    descriptionAmharic: 'የፀጉር መነቃቀልን የሚያቆም እና ፎረፎርን የሚያጠፋ የተፈጥሮ ቅባት።',
    price: 1100,
    discountPrice: 950,
    categorySlug: 'beauty-personal-care',
    stock: 28,
    sku: 'SNE-BEA-003',
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'],
    attributes: { Volume: '100ml', Ingredients: 'Rosemary, Moringa, Castor Oil' },
  },
  {
    title: 'Long-Lasting Oriental Amber & Oud Perfume 100ml',
    titleAmharic: 'ለረጅም ሰዓታት የሚቆይ ምርጥ የሽቶ መዓዛ',
    slug: 'long-lasting-oriental-amber-oud-perfume-100ml',
    description: 'Enchanting blend of frankincense, amber, and rich agarwood with 24-hour scent projection.',
    descriptionAmharic: 'የዕጣን እና የአምበር መዓዛ ያለው ማራኪ ሽቶ።',
    price: 3200,
    categorySlug: 'beauty-personal-care',
    stock: 15,
    sku: 'SNE-BEA-004',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'],
    attributes: { Type: 'Eau de Parfum', ScentFamily: 'Amber Woody' },
  },

  // --- Category 7: Books & Stationery (4 items) ---
  {
    title: 'Oromay (ኦሮማይ) by Bealu Girma - Hardcover Classic',
    titleAmharic: 'ኦሮማይ - በበዓሉ ግርማ (ጠንካራ ሽፋን)',
    slug: 'oromay-by-bealu-girma-hardcover-classic',
    description: 'Masterpiece of modern Ethiopian literature capturing the dramatic historical saga in Asmara.',
    descriptionAmharic: 'የበዓሉ ግርማ ዝነኛ ታሪካዊ ልብወለድ መጽሐፍ።',
    price: 450,
    categorySlug: 'books-stationery',
    stock: 60,
    sku: 'SNE-BOK-001',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    attributes: { Author: 'Bealu Girma', Language: 'Amharic', Edition: 'Collector Edition' },
  },
  {
    title: 'The Real Fikir Eske Mekabir (ፍቅር እስከ መቃብር)',
    titleAmharic: 'ፍቅር እስከ መቃብር - በሀዲስ አለማየሁ',
    slug: 'fikir-eske-mekabir-by-haddis-alemayehu',
    description: 'Ethiopia most beloved novel of eternal romance and social transformation by Haddis Alemayehu.',
    descriptionAmharic: 'በክቡር ዶ/ር ሃዲስ አለማየሁ የተደረሰ ታላቅ የፍቅር ልብወለድ።',
    price: 520,
    discountPrice: 470,
    categorySlug: 'books-stationery',
    stock: 45,
    sku: 'SNE-BOK-002',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'],
    attributes: { Author: 'Haddis Alemayehu', Format: 'Paperback', Pages: '528' },
  },
  {
    title: 'Handcrafted Leather Bound Journal & Fountain Pen',
    titleAmharic: 'የቆዳ ማስታወሻ ደብተር እና የብርዕ እስክሪብቶ',
    slug: 'handcrafted-leather-bound-journal-fountain-pen',
    description: '200 unlined vintage cotton pages enclosed in soft brown Ethiopian calfskin leather.',
    descriptionAmharic: 'ከእውነተኛ ቆዳ የተሰራ ለሃሳብ እና ለዕለታዊ ማስታወሻ የሚሆን ደብተር።',
    price: 1350,
    categorySlug: 'books-stationery',
    stock: 25,
    sku: 'SNE-BOK-003',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
    attributes: { Cover: 'Calfskin Leather', Pages: '200 Cotton Pages', Size: 'A5' },
  },
  {
    title: 'Artist Sketching Pencil & Charcoal Set 24 Pieces',
    titleAmharic: 'የስዕል መሳያ እርሳስ እና ከሰል ስብስብ (24 ቁራጭ)',
    slug: 'artist-sketching-pencil-charcoal-set-24-pieces',
    description: 'Complete drawing kit ranging from 9B to 9H graphite pencils with kneaded eraser and sharpener.',
    descriptionAmharic: 'ለሰዓሊዎች እና ለተማሪዎች የሚሆን የተሟላ የስዕል መሳያ ስብስብ።',
    price: 950,
    discountPrice: 850,
    categorySlug: 'books-stationery',
    stock: 35,
    sku: 'SNE-BOK-004',
    images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'],
    attributes: { Pieces: '24 items', Case: 'Zippered Canvas Roll' },
  },

  // --- Category 8: Sports & Outdoor Products (4 items) ---
  {
    title: 'Elite Distance Marathon Running Shoes',
    titleAmharic: 'ለረጅም ርቀት ሩጫ የሚሆኑ ቀላል ጫማዎች',
    slug: 'elite-distance-marathon-running-shoes',
    description: 'Carbon-fiber plated lightweight racers inspired by Ethiopian world-record marathon champions.',
    descriptionAmharic: 'ለሯጮች የሚሆን ካርቦን ፕሌት ያለው እጅግ ቀላል የማራቶን ጫማ።',
    price: 8900,
    discountPrice: 7990,
    categorySlug: 'sports-outdoors',
    stock: 10,
    sku: 'SNE-SPO-001',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
    attributes: { Cushioning: 'Carbon Fiber Foam', Weight: '185g', Drop: '8mm' },
  },
  {
    title: 'Smart Fitness Tracker with Heart Rate & GPS',
    titleAmharic: 'የልብ ምት እና የአካል ብቃት እንቅስቃሴ መቆጣጠሪያ ሰዓት',
    slug: 'smart-fitness-tracker-heart-rate-gps',
    description: 'Waterproof activity watch tracking 30+ sports modes, sleep quality, and VO2 max stamina.',
    descriptionAmharic: 'የስፖርት እንቅስቃሴን እና ጤናን የሚከታተል ስማርት ሰዓት።',
    price: 3600,
    discountPrice: 3200,
    categorySlug: 'sports-outdoors',
    stock: 2, // Low stock demo
    sku: 'SNE-SPO-002',
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80'],
    attributes: { Battery: '14 Days', WaterResistance: '5 ATM', GPS: 'Dual-Band' },
  },
  {
    title: 'Adjustable Dumbbells Set with Stand 20KG',
    titleAmharic: 'የቤት ውስጥ ስፖርት መስሪያ ዳምብል 20 ኪ.ግ',
    slug: 'adjustable-dumbbells-set-with-stand-20kg',
    description: 'Space-saving quick-change dumbbell system with knurled handles for home gym workouts.',
    descriptionAmharic: 'ክብደቱ የሚስተካከል ለቤት ውስጥ ብርታት ስራ ተስማሚ ዳምብል።',
    price: 6500,
    categorySlug: 'sports-outdoors',
    stock: 12,
    sku: 'SNE-SPO-003',
    images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'],
    attributes: { MaxWeight: '20KG Pair', Mechanism: 'Quick Dial Adjust' },
  },
  {
    title: 'Waterproof 4-Person Camping Tent with Rainfly',
    titleAmharic: 'ውሃ የማያሳልፍ ባለ 4 ሰው የጉዞ ድንኳን',
    slug: 'waterproof-4-person-camping-tent-with-rainfly',
    description: 'Fast 5-minute setup tent designed for Ethiopian highlands hiking, Langano camping, and safari trips.',
    descriptionAmharic: 'ለተፈጥሮ ጉዞ እና ለመዝናኛ የሚሆን በቀላሉ የሚተከል ድንኳን።',
    price: 7400,
    discountPrice: 6700,
    categorySlug: 'sports-outdoors',
    stock: 8,
    sku: 'SNE-SPO-004',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'],
    attributes: { Capacity: '4 Adults', WeatherProtection: '3000mm Polyurethane' },
  },
];

export const SEED_CUSTOMERS: SeedCustomer[] = [
  {
    name: 'Abebe Kebede (Demo Customer)',
    email: 'demo.abebe@shopnest.et',
    phone: '+251911223344',
    password: 'DemoCustomer2026!',
    address: {
      fullName: 'Abebe Kebede',
      phone: '+251911223344',
      city: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '03',
      houseNumber: 'Bole-142',
      landmark: 'Near Edna Mall',
      isDefault: true,
    },
  },
  {
    name: 'Tigist Tadesse (Demo Customer)',
    email: 'demo.tigist@shopnest.et',
    phone: '+251922334455',
    password: 'DemoCustomer2026!',
    address: {
      fullName: 'Tigist Tadesse',
      phone: '+251922334455',
      city: 'Addis Ababa',
      subCity: 'Kirkos',
      woreda: '01',
      houseNumber: 'Meskel-22',
      landmark: 'Behind Stadium',
      isDefault: true,
    },
  },
  {
    name: 'Dawit Haile (Demo Customer)',
    email: 'demo.dawit@shopnest.et',
    phone: '+251933445566',
    password: 'DemoCustomer2026!',
    address: {
      fullName: 'Dawit Haile',
      phone: '+251933445566',
      city: 'Hawassa',
      subCity: 'Menahariya',
      woreda: '04',
      houseNumber: 'HWS-88',
      landmark: 'Opposite Lake Park',
      isDefault: true,
    },
  },
  {
    name: 'Meron Bekele (Demo Customer)',
    email: 'demo.meron@shopnest.et',
    phone: '0944556677',
    password: 'DemoCustomer2026!',
    address: {
      fullName: 'Meron Bekele',
      phone: '0944556677',
      city: 'Bahir Dar',
      subCity: 'Gish Abay',
      woreda: '02',
      houseNumber: 'BDR-105',
      landmark: 'Near Tana Hotel',
      isDefault: true,
    },
  },
];

export const SEED_COUPONS: SeedCoupon[] = [
  {
    code: 'WELCOME2026',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    maxDiscount: 300,
    expiryDaysFromNow: 90,
    usageLimit: 200,
  },
  {
    code: 'TELEBIRR50',
    discountType: 'fixed_amount',
    discountValue: 50,
    minOrderValue: 400,
    expiryDaysFromNow: 60,
    usageLimit: 500,
  },
  {
    code: 'HABESHA15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 1500,
    maxDiscount: 600,
    expiryDaysFromNow: 120,
    usageLimit: 100,
  },
];
