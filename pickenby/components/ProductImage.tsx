import Image from "next/image";
import { Package } from "lucide-react";

/**
 * Renders the product photo when `src` exists, otherwise a neutral placeholder.
 * Swap in real URLs (and add the host to next.config.ts) when your API is ready.
 */
export function ProductImage({
  src,
  alt,
  className = "",
  sizes = "(min-width:1024px) 220px, 45vw",
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-contain p-4" />
      ) : (
        <Package aria-hidden className="size-10 text-muted/40" strokeWidth={1.25} />
      )}
    </div>
  );
}
