// Product catalogue — the Cholan Rice and Millet Shops Pvt Ltd product list.
// Each product lists the pack sizes it is sold in; `tamil` is the name as it
// appears on the shop's own list. Prices are not confirmed yet, so every
// pack is `price: null` (and prices are switched off in site.js).
// Add/edit freely — the UI adapts.

export const categories = [
  {
    slug: "rice",
    name: "Rice",
    blurb: "Karikalan, Chennai Pattinam, Moongil Ponni, idli rice and more.",
    image: "/images/categories/rice.webp",
  },
  {
    slug: "traditional",
    name: "Traditional Rice",
    blurb: "Kavuni, Mappillai Samba, Karunkuruvai, Kerala Matta and hand-pounded rice.",
    image: "/images/categories/traditional.webp",
  },
  {
    slug: "millets",
    name: "Millets",
    blurb: "Kuthiraivali, samai, thinai, varagu, ragi and kollu.",
    image: "/images/categories/millets.webp",
  },
  {
    slug: "grocery",
    name: "Grocery",
    blurb: "Nattu ulundhu and unrefined nattu sakkarai.",
    image: "/images/categories/grocery.webp",
  },
];

const sizes = (...list) => list.map((size) => ({ size, price: null }));

export const products = [
  // ---------- RICE ----------
  {
    id: "karikalan-rice",
    name: "Karikalan Rice",
    tamil: "கரிகாலன்",
    category: "rice",
    tagline: "கரிகாலன் · Premium Ponni",
    description:
      "Our Karikalan grade — a well-aged premium Ponni with good separation and a rich aroma when cooked. Sold from the 5 kg family bag up to the 26 kg sack.",
    packs: sizes("5 kg", "10 kg", "26 kg"),
    image: "/images/products/karikalan-rice.webp",
    featured: true,
  },
  {
    id: "chennai-pattinam-idli-rice",
    name: "Chennai Pattinam Idli Rice",
    tamil: "சென்னைப்பட்டிணம் இட்லி",
    category: "rice",
    tagline: "சென்னைப்பட்டிணம் இட்லி · For idli and dosa",
    description:
      "Idli rice in the Chennai Pattinam pack, milled for batter — for soft idlis and crisp dosas.",
    packs: sizes("5 kg", "10 kg", "26 kg"),
    image: "/images/products/idly-rice.webp",
    featured: true,
  },
  {
    id: "chennai-pattinam-rice",
    name: "Chennai Pattinam Rice",
    tamil: "சென்னைப்பட்டிணம்",
    category: "rice",
    tagline: "சென்னைப்பட்டிணம் · Everyday rice",
    description:
      "Everyday table rice in the Chennai Pattinam pack, from the 1 kg pack up to the 26 kg sack.",
    packs: sizes("1 kg", "5 kg", "10 kg", "26 kg"),
    image: "/images/products/ponni-rice.webp",
    featured: true,
  },
  {
    id: "moongil-ponni",
    name: "Moongil Ponni Rice",
    tamil: "மூங்கில் பொன்னி",
    category: "rice",
    tagline: "மூங்கில் பொன்னி · Ponni rice",
    description: "Ponni rice in the Cholan Moongil pack, for daily meals.",
    packs: sizes("5 kg", "10 kg", "26 kg"),
    image: "/images/products/moongil-rice.webp",
  },
  {
    id: "thooyamalli-ponni-raw-rice",
    name: "Thooyamalli Ponni Raw Rice",
    tamil: "தூயமல்லி பொன்னி பச்சரிசி",
    category: "rice",
    tagline: "தூயமல்லி பொன்னி பச்சரிசி · Raw rice",
    description: "Thooyamalli Ponni pacharisi — raw (unboiled) rice.",
    packs: sizes("1 kg", "5 kg", "26 kg"),
  },
  {
    id: "senthura-rice",
    name: "Senthura Rice",
    tamil: "செந்தூரா",
    category: "rice",
    tagline: "செந்தூரா",
    description: "Senthura rice, in the 10 kg and 26 kg bags.",
    packs: sizes("10 kg", "26 kg"),
  },
  {
    id: "senthura-half-boil-rice",
    name: "Senthura Half-Boil Rice",
    tamil: "செந்தூரா HALFBOIL",
    category: "rice",
    tagline: "செந்தூரா · Half-boiled",
    description: "The half-boiled Senthura rice, in the 26 kg bag.",
    packs: sizes("26 kg"),
  },
  {
    id: "kettimelam-rice",
    name: "Kettimelam Rice",
    tamil: "கெட்டிமேளம்",
    category: "rice",
    tagline: "கெட்டிமேளம்",
    description: "Kettimelam rice, in the 26 kg bag for larger households and messes.",
    packs: sizes("26 kg"),
    image: "/images/products/gettimelam-ponni.webp",
  },
  {
    id: "baahubali-rice",
    name: "Baahubali Rice",
    tamil: "பாகுபலி",
    category: "rice",
    tagline: "பாகுபலி",
    description: "Baahubali rice, in the 26 kg bag.",
    packs: sizes("26 kg"),
  },
  {
    id: "kurunai-rice",
    name: "Kurunai Rice (Broken Rice)",
    tamil: "குருணை அரிசி",
    category: "rice",
    tagline: "குருணை அரிசி · For kanji and pongal",
    description:
      "Broken rice, cleaned and graded — the traditional choice for kanji, pongal and upma. Sold in the 26 kg bag.",
    packs: sizes("26 kg"),
    image: "/images/pack-broken-ponni.webp",
  },
  {
    id: "canteen-special-rice",
    name: "Canteen Special Rice",
    tamil: "கேண்டீன் ஸ்பெஷல்",
    category: "rice",
    tagline: "கேண்டீன் ஸ்பெஷல் · For canteens and messes",
    description: "Our Canteen Special rice, for canteens, messes and bulk kitchens. Enquire for pack sizes.",
    packs: [],
  },
  {
    id: "basmati-rice",
    name: "Basmati Rice",
    tamil: "பாசுமதி அரிசி",
    category: "rice",
    tagline: "பாசுமதி · For biryani and pulao",
    description:
      "Long-grain basmati that stays separate when cooked — for biryani, pulao and ghee rice.",
    packs: sizes("1 kg", "5 kg"),
    image: "/images/products/basmati-rice.webp",
  },
  {
    id: "chennai-gate-rice",
    name: "Chennai Gate Rice",
    tamil: "சென்னை கேட்",
    category: "rice",
    tagline: "சென்னை கேட்",
    description: "Chennai Gate rice, in the 1 kg pack.",
    packs: sizes("1 kg"),
  },
  {
    id: "mappillai-seeraga-samba",
    name: "Mappillai Seeraga Samba Rice",
    tamil: "மாப்பிள்ளை சீரக சம்பா",
    category: "rice",
    tagline: "மாப்பிள்ளை சீரக சம்பா",
    description: "Seeraga samba rice, in the 1 kg pack.",
    packs: sizes("1 kg"),
  },
  {
    id: "special-idli-rice-pink",
    name: "Special Idli Rice (Pink)",
    tamil: "ஸ்பெஷல் இட்லி (Pink)",
    category: "rice",
    tagline: "ஸ்பெஷல் இட்லி · Pink pack",
    description: "Special idli rice in the pink pack, for batter. Sold in the 1 kg pack.",
    packs: sizes("1 kg"),
  },

  // ---------- TRADITIONAL RICE ----------
  {
    id: "mappillai-samba",
    name: "Mappillai Samba Rice",
    tamil: "மாப்பிள்ளைச் சம்பா",
    category: "traditional",
    tagline: "மாப்பிள்ளைச் சம்பா · Red heritage rice",
    description:
      "A deep red traditional rice with an earthy flavour. Sold in the 500 g pack and the 26 kg bag.",
    packs: sizes("500 g", "26 kg"),
    featured: true,
  },
  {
    id: "karuppu-kavuni",
    name: "Karuppu Kavuni Rice",
    tamil: "கருப்புக் கவுனி அரிசி",
    category: "traditional",
    tagline: "கருப்புக் கவுனி · Black rice",
    description: "Traditional black rice that cooks to a deep purple.",
    packs: sizes("500 g"),
    featured: true,
  },
  {
    id: "sigappu-kavuni",
    name: "Sigappu Kavuni Rice",
    tamil: "சிகப்புக் கவுனி அரிசி",
    category: "traditional",
    tagline: "சிகப்புக் கவுனி · Red rice",
    description: "The red counterpart to Karuppu Kavuni — a traditional red rice.",
    packs: sizes("500 g"),
  },
  {
    id: "karunkuruvai",
    name: "Karunkuruvai Rice",
    tamil: "கருங்குறுவை",
    category: "traditional",
    tagline: "கருங்குறுவை · Traditional rice",
    description: "Karunkuruvai, a native Tamil traditional rice variety.",
    packs: sizes("500 g"),
  },
  {
    id: "kerala-matta-rice",
    name: "Kerala Matta Rice",
    tamil: "கேரளா மட்டை அரிசி",
    category: "traditional",
    tagline: "கேரளா மட்டை · Bold and hearty",
    description: "Parboiled Kerala matta rice with its reddish hue and robust bite.",
    packs: sizes("1 kg"),
  },
  {
    id: "kaikuthal-rice",
    name: "Kaikuthal Rice (Hand-pounded)",
    tamil: "கைக்குத்தல் அரிசி",
    category: "traditional",
    tagline: "கைக்குத்தல் · Hand-pounded",
    description: "Hand-pounded rice, minimally milled so the bran layer stays on the grain.",
    packs: sizes("1 kg"),
  },

  // ---------- MILLETS ----------
  {
    id: "kuthiraivali",
    name: "Kuthiraivali (Barnyard Millet)",
    tamil: "குதிரைவாலி",
    category: "millets",
    tagline: "குதிரைவாலி · Barnyard millet",
    description: "Barnyard millet — quick to cook, good for pongal and upma.",
    packs: sizes("500 g"),
  },
  {
    id: "samai",
    name: "Samai (Little Millet)",
    tamil: "சாமை அரிசி",
    category: "millets",
    tagline: "சாமை · Little millet",
    description: "Little millet, easy to cook. Works for pongal, upma, idli batter and lemon rice.",
    packs: sizes("500 g"),
  },
  {
    id: "thinai",
    name: "Thinai (Foxtail Millet)",
    tamil: "தினை அரிசி",
    category: "millets",
    tagline: "தினை · Foxtail millet",
    description: "Foxtail millet — light on the stomach and a straight swap for rice in most dishes.",
    packs: sizes("500 g"),
  },
  {
    id: "varagu",
    name: "Varagu (Kodo Millet)",
    tamil: "வரகு அரிசி",
    category: "millets",
    tagline: "வரகு · Kodo millet",
    description: "Kodo millet, a traditional everyday millet.",
    packs: sizes("500 g"),
  },
  {
    id: "ragi",
    name: "Ragi (Finger Millet)",
    tamil: "ராகி (கேழ்வரகு)",
    category: "millets",
    tagline: "ராகி (கேழ்வரகு) · Finger millet",
    description: "Finger millet, for kanji, koozh and adai.",
    packs: sizes("500 g"),
    featured: true,
  },
  {
    id: "kollu",
    name: "Kollu (Horse Gram)",
    tamil: "கொள்ளு",
    category: "millets",
    tagline: "கொள்ளு · Horse gram",
    description: "Kollu, long used in Tamil kitchens for rasam, sundal and podi.",
    packs: sizes("500 g"),
  },

  // ---------- GROCERY ----------
  {
    id: "nattu-ulundhu",
    name: "Nattu Ulundhu (Native Urad Dal)",
    tamil: "நாட்டு உளுந்து",
    category: "grocery",
    tagline: "நாட்டு உளுந்து · Native urad",
    description: "Native urad, for idli and dosa batter, vadai and more.",
    packs: sizes("500 g"),
  },
  {
    id: "nattu-sakkarai",
    name: "Nattu Sakkarai",
    tamil: "நாட்டுச் சர்க்கரை",
    category: "grocery",
    tagline: "நாட்டுச் சர்க்கரை · Unrefined cane sugar",
    description: "Traditional unrefined cane sugar — for coffee, sweets and baking in place of white sugar.",
    packs: sizes("500 g"),
  },
];

// ---- helpers ----
export const getProduct = (id) => products.find((p) => p.id === id);

export const getByCategory = (slug) =>
  slug === "all" ? products : products.filter((p) => p.category === slug);

export const featuredProducts = () => products.filter((p) => p.featured);

// The home page row: bestsellers with a pack photo first, then any other
// product with a photo, so the row is never a wall of lettered tiles.
export const showcaseProducts = (n) => {
  const photo = products.filter((p) => hasPhoto(p));
  return [...photo.filter((p) => p.featured), ...photo.filter((p) => !p.featured)].slice(0, n);
};

// Lowest published price, or null when no pack has a price yet.
export const priceFrom = (product) => {
  const prices = product.packs.map((pack) => pack.price).filter((p) => p != null);
  return prices.length ? Math.min(...prices) : null;
};

// A pack without a price reads as "Price on request" rather than ₹0 or NaN.
export const formatINR = (n) => (n == null ? "Price on request" : `₹${n.toLocaleString("en-IN")}`);

// Real pack photos are WebP cut-outs; everything else is still a placeholder.
export const hasPhoto = (product) => Boolean(product.image?.endsWith(".webp"));
