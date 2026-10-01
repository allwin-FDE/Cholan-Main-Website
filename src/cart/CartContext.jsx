import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "../data/products";

/*
  The cart: a list of { id, size, qty } lines, one per product and pack size.
  Kept in localStorage so it survives a reload, and joined to the product
  data on read, so a price change in products.js shows up in carts already
  filled. Orders are sent on WhatsApp — there is no checkout backend.
*/

const STORAGE_KEY = "cholan-cart-v1";
const CartContext = createContext(null);

export const lineKey = (id, size) => `${id}|${size ?? ""}`;

// The pack a card adds: the cheapest priced one, else the first listed,
// else none (sold on enquiry).
export const defaultPack = (product) => {
  const priced = product.packs.filter((p) => p.price != null);
  if (priced.length) return priced.reduce((a, b) => (b.price < a.price ? b : a));
  return product.packs[0] ?? { size: null, price: null };
};

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((l) => getProduct(l.id) && l.qty > 0) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* Private mode or full storage: the cart still works for this visit. */
    }
  }, [lines]);

  const setQty = useCallback((id, size, qty) => {
    const key = lineKey(id, size);
    setLines((prev) => {
      const next = prev.filter((l) => lineKey(l.id, l.size) !== key);
      if (qty <= 0) return next;
      const at = prev.findIndex((l) => lineKey(l.id, l.size) === key);
      const line = { id, size, qty: Math.min(qty, 99) };
      // Keep the line where it was, so the drawer does not reshuffle.
      if (at >= 0) next.splice(at, 0, line);
      else next.push(line);
      return next;
    });
  }, []);

  const value = useMemo(() => {
    const qtyOf = (id, size) => lines.find((l) => lineKey(l.id, l.size) === lineKey(id, size))?.qty ?? 0;
    const items = lines.map((l) => {
      const product = getProduct(l.id);
      const pack = product.packs.find((p) => p.size === l.size);
      const price = pack?.price ?? null;
      return { ...l, key: lineKey(l.id, l.size), product, price, total: price == null ? null : price * l.qty };
    });
    return {
      items,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: items.reduce((s, i) => s + (i.total ?? 0), 0),
      hasUnpriced: items.some((i) => i.price == null),
      qtyOf,
      setQty,
      add: (id, size, by = 1) => setQty(id, size, qtyOf(id, size) + by),
      clear: () => setLines([]),
      open,
      setOpen,
    };
  }, [lines, open, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
