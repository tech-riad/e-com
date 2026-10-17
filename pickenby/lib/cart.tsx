"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Product, ProductColor } from "@/lib/data";

export type CartItem = {
  cartKey: string;
  id: string;
  slug?: string;
  title: string;
  price: number;
  mrp: number;
  image?: string;
  brand?: string;
  color?: ProductColor;
  qty: number;
};

const makeCartKey = (id: string, color?: ProductColor) =>
  `${id}::${color ? `${color.name.trim().toLowerCase()}|${color.hexCode?.toLowerCase() ?? ""}` : ""}`;

type State = { items: CartItem[] };

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "qty"> }
  | { type: "remove"; cartKey: string }
  | { type: "setQty"; cartKey: string; qty: number }
  | { type: "clear" };

const STORAGE_KEY = "pickenby-cart";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const existing = state.items.find((i) => i.cartKey === action.item.cartKey);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.cartKey === action.item.cartKey ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.cartKey !== action.cartKey) };
    case "setQty":
      return {
        items: state.items
          .map((i) =>
            i.cartKey === action.cartKey ? { ...i, qty: Math.max(1, action.qty) } : i
          )
          .filter((i) => i.qty > 0),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (p: Product, color?: ProductColor) => void;
  removeItem: (cartKey: string) => void;
  setQty: (cartKey: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function toCartItem(p: Product, color?: ProductColor): Omit<CartItem, "qty"> {
  return {
    cartKey: makeCartKey(p.id, color),
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    brand: p.brand,
    color,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const items = parsed.map((item) => {
            const cartItem = item as CartItem;
            return {
              ...cartItem,
              cartKey: cartItem.cartKey || makeCartKey(cartItem.id, cartItem.color),
            };
          });
          dispatch({ type: "hydrate", items });
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // storage may be unavailable (private mode)
    }
  }, [state.items]);

  const addItem = useCallback((p: Product, color?: ProductColor) => {
    dispatch({ type: "add", item: toCartItem(p, color) });
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    dispatch({ type: "remove", cartKey });
  }, []);

  const setQty = useCallback((cartKey: string, qty: number) => {
    dispatch({ type: "setQty", cartKey, qty });
  }, []);

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((s, i) => s + i.qty, 0);
    const subtotal = state.items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items: state.items, count, subtotal, addItem, removeItem, setQty, clear };
  }, [state.items, addItem, removeItem, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}