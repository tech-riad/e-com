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
import type { Product } from "@/lib/data";

export type CartItem = {
  id: string;
  slug?: string;
  title: string;
  price: number;
  mrp: number;
  image?: string;
  brand?: string;
  qty: number;
};

type State = { items: CartItem[] };

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "qty"> }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "clear" };

const STORAGE_KEY = "pickenby-cart";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "setQty":
      return {
        items: state.items
          .map((i) =>
            i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
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
  addItem: (p: Product) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function toCartItem(p: Product): Omit<CartItem, "qty"> {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    mrp: p.mrp,
    image: p.image,
    brand: p.brand,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", items: parsed });
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

  const addItem = useCallback((p: Product) => {
    dispatch({ type: "add", item: toCartItem(p) });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "remove", id });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    dispatch({ type: "setQty", id, qty });
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