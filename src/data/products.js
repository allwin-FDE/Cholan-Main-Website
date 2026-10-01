// Product catalogue. Prices in INR, taken from the current Cholan Rice store.
// `packs` = the sizes each item is sold in. Add/edit freely — the UI adapts.

export const categories = [
  {
    slug: "rice",
    name: "Rice",
    blurb: "Everyday Ponni, idly rice and traditional native varieties.",
    image: "/images/cat-rice.jpg",
  },
  {
    slug: "millets",
    name: "Millets",
    blurb: "Native small millets — kambu, thinai, varagu, ragi and more.",
    image: "/images/cat-millets.jpg",
  },
  {
    slug: "oils",
    name: "Oils",
    blurb: "Wood-pressed sesame and groundnut oil.",
    image: "/images/cat-oils.jpg",
  },
  {
    slug: "pulses",
    name: "Pulses & Sugar",
    blurb: "Dhal varieties and unrefined nattu sarkkarai.",
    image: "/images/cat-pulses.jpg",
  },
];

export const products = [
  // ---------- RICE ----------
  {
    id: "rajabogam-ponni",
    name: "Rajabogam Ponni Rice",
    category: "rice",
    tagline: "Our flagship Ponni, in the Cholan pack",
    description:
      "The Rajabogam grade — a full, well-aged Ponni milled for everyday sappadu. Soft, aromatic and consistent bag to bag. Sold in the 26 kg Cholan pack that messes and larger households buy month after month.",
    packs: [
      { size: "5 kg", price: 420 },
      { size: "10 kg", price: 830 },
      { size: "26 kg", price: 1980 },
    ],
    image: "/images/pack-rajabogam.webp",
    featured: true,
  },
  {
    id: "ponni-broken-rice",
    name: "Ponni Broken Rice",
    category: "rice",
    tagline: "For kanji, pongal and everyday value",
    description:
      "Broken Ponni graded and cleaned to the same standard as our whole grain. Cooks quickly and soaks up flavour — the traditional choice for kanji, pongal, upma and idli batter, at a lower price per kilo.",
    packs: [
      { size: "5 kg", price: 260 },
      { size: "10 kg", price: 500 },
      { size: "26 kg", price: 1150 },
    ],
    image: "/images/pack-broken-ponni.webp",
    featured: true,
  },
  {
    id: "ponni-rice",
    name: "Ponni Rice",
    category: "rice",
    tagline: "The everyday table rice of Tamil Nadu",
    description:
      "Medium-grain rice known for its soft texture and gentle aroma. Cooks fluffy and stays soft — the dependable choice for daily meals.",
    packs: [
      { size: "5 kg", price: 400 },
      { size: "10 kg", price: 800 },
      { size: "26 kg", price: 1900 },
    ],
    image: "/images/products/ponni-rice.webp",
    featured: true,
  },
  {
    id: "idly-rice",
    name: "Idly Rice",
    category: "rice",
    tagline: "For soft idlis and crisp dosas",
    description:
      "Parboiled short-grain rice milled specifically for batter. Ferments well and gives you idlis that stay soft through the day.",
    packs: [
      { size: "5 kg", price: 280 },
      { size: "10 kg", price: 530 },
      { size: "26 kg", price: 1200 },
    ],
    image: "/images/products/idly-rice.webp",
    featured: true,
  },
  {
    id: "karikalan-rice",
    name: "Karikalan Rice",
    category: "rice",
    tagline: "Premium Ponni, aged for flavour",
    description:
      "A well-aged premium Ponni grade. Lower moisture, better separation, richer aroma when cooked.",
    packs: [
      { size: "5 kg", price: 375 },
      { size: "26 kg", price: 1750 },
    ],
    image: "/images/products/karikalan-rice.webp",
    featured: true,
  },
  {
    id: "moongil-rice",
    name: "Moongil Rice",
    category: "rice",
    tagline: "The Cholan Moongil pack, 26 kg",
    description:
      "Rice in the Cholan Moongil (மூங்கில்) pack, sold in the 26 kg bag for households and messes that buy by the month. Enquire on WhatsApp for the current rate.",
    // No price published yet — the site shows "Price on request" until one is set.
    packs: [{ size: "26 kg", price: null }],
    image: "/images/products/moongil-rice.webp",
  },
  {
    id: "gettimelam-ponni",
    name: "Gettimelam Ponni Rice",
    category: "rice",
    tagline: "Hardy grain, everyday value",
    description:
      "A firm-grained Ponni variety that holds shape well in cooking. A staple for larger households and messes.",
    packs: [{ size: "26 kg", price: 1650 }],
    image: "/images/products/gettimelam-ponni.webp",
  },
  {
    id: "tn-bpt-rice",
    name: "TN BPT Rice",
    category: "rice",
    tagline: "Soft, light and easy to digest",
    description:
      "The Tamil Nadu BPT grade — a lighter, softer grain that suits everyday sappadu and curd rice especially well.",
    packs: [
      { size: "5 kg", price: 315 },
      { size: "10 kg", price: 600 },
      { size: "26 kg", price: 1550 },
    ],
    image: "/images/products/tn-bpt-rice.webp",
  },
  {
    id: "basmati-rice",
    name: "Basmati Rice",
    category: "rice",
    tagline: "Long grain, for biryani and pulao",
    description:
      "Fine long-grain basmati that elongates on cooking and stays separate. Made for biryani, pulao and ghee rice.",
    packs: [],
    image: "/images/products/basmati-rice.webp",
  },
  {
    id: "poongar-rice",
    name: "Poongar Rice",
    category: "rice",
    tagline: "Traditional variety, valued in women's wellness",
    description:
      "A native red rice long recommended in traditional Tamil households for women's wellbeing. Nutty, wholesome and rich in fibre.",
    packs: [
      { size: "500 g", price: 60 },
    ],
    image: "/images/poongar-rice.jpg",
  },
  {
    id: "mapillai-samba",
    name: "Mapillai Samba Rice",
    category: "rice",
    tagline: "The strength-giving heritage rice",
    description:
      "A deep red traditional rice long associated with stamina and strength. Earthy flavour, high in fibre and iron.",
    packs: [],
    image: "/images/mapillai-samba.jpg",
    featured: true,
  },
  {
    id: "karuppu-kavuni",
    name: "Karuppu Kavuni Rice",
    category: "rice",
    tagline: "Black rice — the 'forbidden' grain",
    description:
      "Antioxidant-rich black rice with a striking deep purple colour when cooked. Traditionally reserved for royalty.",
    packs: [
      { size: "500 g", price: 120 },
    ],
    image: "/images/karuppu-kavuni.jpg",
    featured: true,
  },
  {
    id: "sigappu-kavuni",
    name: "Sigappu Kavuni Rice",
    category: "rice",
    tagline: "Red heritage rice",
    description:
      "The red counterpart to Karuppu Kavuni. Mildly sweet, high in fibre, and a good everyday swap for white rice.",
    packs: [],
    image: "/images/sigappu-kavuni.jpg",
  },
  {
    id: "handpound-rice",
    name: "Handpound Rice (Kaikuthal)",
    category: "rice",
    tagline: "Minimally milled, bran intact",
    description:
      "Traditionally hand-pounded so the nutrient-rich bran layer stays on the grain. Closest you get to unpolished rice.",
    packs: [],
    image: "/images/handpound-rice.jpg",
  },
  {
    id: "kerala-rice",
    name: "Kerala Rice",
    category: "rice",
    tagline: "Rosematta — bold and hearty",
    description:
      "Parboiled rosematta rice with a distinctive reddish hue and robust bite. A Kerala kitchen staple.",
    packs: [],
    image: "/images/kerala-rice.jpg",
  },

  // ---------- MILLETS ----------
  {
    id: "regular-kambu",
    name: "Kambu (Pearl Millet)",
    category: "millets",
    tagline: "Iron-rich and cooling",
    description:
      "Pearl millet, a summer staple. High in iron and fibre — good as kanji, koozh or steamed like rice.",
    packs: [{ size: "500 g", price: 75 }],
    image: "/images/kambu.jpg",
  },
  {
    id: "traditional-kambu",
    name: "Traditional Kambu",
    category: "millets",
    tagline: "Native landrace pearl millet",
    description:
      "The older native landrace of kambu — smaller grain, stronger flavour, traditionally valued as a body coolant.",
    packs: [
      { size: "500 g", price: 70 },
      { size: "1 kg", price: 140 },
    ],
    image: "/images/traditional-kambu.jpg",
  },
  {
    id: "ragi",
    name: "Ragi (Finger Millet)",
    category: "millets",
    tagline: "Calcium powerhouse",
    description:
      "Finger millet, among the richest plant sources of calcium. Ideal for kanji, koozh and weaning food.",
    packs: [
      { size: "500 g", price: 30 },
      { size: "1 kg", price: 60 },
    ],
    image: "/images/ragi.jpg",
    featured: true,
  },
  {
    id: "thinai",
    name: "Thinai (Foxtail Millet)",
    category: "millets",
    tagline: "Light, low glycaemic",
    description:
      "Foxtail millet — light on the stomach with a low glycaemic index. A straight swap for rice in most dishes.",
    packs: [
      { size: "500 g", price: 65 },
      { size: "1 kg", price: 130 },
    ],
    image: "/images/thinai.jpg",
  },
  {
    id: "samai",
    name: "Samai (Little Millet)",
    category: "millets",
    tagline: "Fibre-dense and versatile",
    description:
      "Little millet, high in fibre and easy to cook. Works for pongal, upma, idli batter and lemon rice.",
    packs: [
      { size: "500 g", price: 65 },
      { size: "1 kg", price: 130 },
    ],
    image: "/images/samai.jpg",
  },
  {
    id: "varagu",
    name: "Varagu (Kodo Millet)",
    category: "millets",
    tagline: "Traditionally used for weight management",
    description:
      "Kodo millet, valued for its high fibre content and slow release of energy. A common choice for diabetic-friendly meals.",
    packs: [
      { size: "500 g", price: 60 },
      { size: "1 kg", price: 120 },
    ],
    image: "/images/varagu.jpg",
  },
  {
    id: "kuthiraivali",
    name: "Kuthiraivali (Barnyard Millet)",
    category: "millets",
    tagline: "Highest fibre of the small millets",
    description:
      "Barnyard millet — the highest in fibre among small millets, and quick to cook. Good for pongal and upma.",
    packs: [
      { size: "500 g", price: 70 },
      { size: "1 kg", price: 140 },
    ],
    image: "/images/kuthiraivali.jpg",
  },
  {
    id: "sigappu-aval",
    name: "Sigappu Aval (Red Poha)",
    category: "millets",
    tagline: "Flattened red rice, ready in minutes",
    description:
      "Red rice flakes — a quick breakfast or snack base. Just soak, season and serve.",
    packs: [
      { size: "500 g", price: 45 },
      { size: "1 kg", price: 90 },
    ],
    image: "/images/sigappu-aval.jpg",
  },

  // ---------- OILS ----------
  {
    id: "sesame-oil",
    name: "Sesame Oil (Nallennai)",
    category: "oils",
    tagline: "Wood-pressed, unrefined",
    description:
      "Traditional wood-pressed gingelly oil. Rich aroma, no chemical extraction — for seasoning, pickles and daily cooking.",
    packs: [
      { size: "500 ml", price: 200 },
      { size: "1 L", price: 380 },
    ],
    image: "/images/sesame-oil.jpg",
    featured: true,
  },
  {
    id: "groundnut-oil",
    name: "Groundnut Oil",
    category: "oils",
    tagline: "High smoke point, clean taste",
    description:
      "Wood-pressed groundnut oil that holds up to deep frying while keeping a clean, nutty flavour.",
    packs: [
      { size: "500 ml", price: 150 },
      { size: "1 L", price: 300 },
    ],
    image: "/images/groundnut-oil.jpg",
  },

  // ---------- PULSES & SUGAR ----------
  {
    id: "horse-gram",
    name: "Horse Gram (Kollu)",
    category: "pulses",
    tagline: "Traditional aid for weight management",
    description:
      "Kollu, a protein-dense pulse long used in Tamil kitchens for rasam, sundal and podi.",
    packs: [{ size: "500 g", price: 50 }],
    image: "/images/horse-gram.jpg",
  },
  {
    id: "nattu-sarkkarai",
    name: "Nattu Sarkkarai",
    category: "pulses",
    tagline: "Unrefined cane sugar",
    description:
      "Traditional unrefined cane sugar with its minerals intact. A direct replacement for white sugar in coffee, sweets and baking.",
    packs: [
      { size: "500 g", price: 50 },
      { size: "1 kg", price: 90 },
    ],
    image: "/images/nattu-sarkkarai.jpg",
  },
];

// ---- helpers ----
export const getProduct = (id) => products.find((p) => p.id === id);

export const getByCategory = (slug) =>
  slug === "all" ? products : products.filter((p) => p.category === slug);

export const featuredProducts = () => products.filter((p) => p.featured);

// Lowest published price, or null when no pack has a price yet.
export const priceFrom = (product) => {
  const prices = product.packs.map((pack) => pack.price).filter((p) => p != null);
  return prices.length ? Math.min(...prices) : null;
};

// A pack without a price reads as "Price on request" rather than ₹0 or NaN.
export const formatINR = (n) => (n == null ? "Price on request" : `₹${n.toLocaleString("en-IN")}`);

// Real pack photos are WebP cut-outs; everything else is still a placeholder.
export const hasPhoto = (product) => Boolean(product.image?.endsWith(".webp"));
