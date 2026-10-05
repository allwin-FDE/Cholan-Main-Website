// Central place for all business info. Change it here, it updates everywhere.
export const site = {
  name: "Cholan Rice & Millets",
  shortName: "Cholan",
  tagline: "Eat healthy millets. Stay fit.",
  intro:
    "From the paddy fields of Tamil Nadu to your kitchen — traditional rice, native millets and cold-pressed oils, sourced and packed with care.",

  phone: "+91 90922 66667",
  phoneRaw: "919092266667",
  email: "cholanricesalem@gmail.com",
  address: {
    line1: "32/A2, SP Kannusamy Gounder St",
    line2: "Sanganoor, Coimbatore",
    pincode: "641027",
    state: "Tamil Nadu, India",
  },
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
  social: {
    instagram: "https://www.instagram.com/cholanrice/",
    facebook: "https://www.facebook.com/profile.php?id=61593548190956",
    linkedin: "https://www.linkedin.com/company/cholan-rice-millets/",
  },
};

/*
  Switches for what the shop shows. Prices are not confirmed yet, so prices
  and the cart are off: products show without prices, and each one is
  enquired about on WhatsApp instead of added to a cart. Set both to true
  once the price list in products.js is final.
*/
export const features = {
  prices: false,
  cart: false,
};

// Prefilled WhatsApp enquiry link. Pass a product to make the message specific.
export function whatsappLink(product) {
  const msg = product
    ? `Hello Cholan Rice, I would like to enquire about "${product.name}". Please share price and availability.`
    : "Hello Cholan Rice, I would like to enquire about your products.";
  return `https://wa.me/${site.phoneRaw}?text=${encodeURIComponent(msg)}`;
}
