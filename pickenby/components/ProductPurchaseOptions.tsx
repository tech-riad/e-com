"use client";

import { useState } from "react";
import type { Product, ProductColor } from "@/lib/data";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";

const isHexColor = (value?: string) =>
  Boolean(value && /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value));

export function ProductPurchaseOptions({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>();
  const [colorError, setColorError] = useState(false);
  const colors = product.colors ?? [];
  const onMissingColor = () => setColorError(true);
  const buttonClass = (tone: "brand" | "amber") =>
    `flex min-h-11 w-full items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 ${
      colorError
        ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-200"
        : tone === "brand"
          ? "bg-brand-700 hover:bg-brand-800"
          : "bg-amber-700 hover:bg-amber-800"
    }`;

  return (
    <>
      {colors.length > 0 && (
        <fieldset className="mt-4">
          <legend className="text-xs font-bold text-ink">
            Color{selectedColor ? `: ${selectedColor.name}` : ": Select one"}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Available colors">
            {colors.map((color, index) => {
              const selected =
                selectedColor?.name === color.name && selectedColor?.hexCode === color.hexCode;
              return (
                <button
                  key={`${color.name}-${color.hexCode ?? ""}-${index}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color.name}
                  onClick={() => {
                    setSelectedColor(color);
                    setColorError(false);
                  }}
                  className={`inline-flex min-h-10 scroll-mt-20 scroll-mb-36 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                    selected
                      ? "border-brand-700 bg-brand-50 text-brand-800"
                      : "border-slate-200 bg-white text-ink hover:border-brand-500"
                  }`}
                >
                  <span
                    aria-hidden
                    className="size-4 rounded-full border border-black/15"
                    style={{ backgroundColor: isHexColor(color.hexCode) ? color.hexCode : "#e5e7eb" }}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
          {colorError ? (
            <p role="alert" className="mt-2 hidden rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 sm:block">
              Please select a color.
            </p>
          ) : !selectedColor ? (
            <p className="mt-1.5 text-xs text-muted">Choose a color before adding to cart.</p>
          ) : null}
        </fieldset>
      )}

      {product.outOfStock ? (
        <p className="mt-4 inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-muted">
          Out of Stock
        </p>
      ) : (
        <>
          <div className="mt-4 hidden w-full gap-2 sm:grid sm:w-[26rem] sm:grid-cols-2">
            <AddToCartButton product={product} color={selectedColor} onMissingColor={onMissingColor} className={buttonClass("brand")} />
            <BuyNowButton product={product} color={selectedColor} onMissingColor={onMissingColor} className={buttonClass("amber")} />
          </div>
          <div
            aria-label="Purchase actions"
            className="fixed inset-x-0 z-40 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-float backdrop-blur sm:hidden"
            role="group"
            style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
          >
            {colorError && (
              <p role="alert" className="col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">
                Please select a color.
              </p>
            )}
            <AddToCartButton
              product={product}
              color={selectedColor}
              onMissingColor={onMissingColor}
              className={buttonClass("brand")}
            />
            <BuyNowButton
              product={product}
              color={selectedColor}
              onMissingColor={onMissingColor}
              className={buttonClass("amber")}
            />
          </div>
        </>
      )}
    </>
  );
}