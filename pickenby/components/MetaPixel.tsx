"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PixelEventData = Record<string, string | number | string[] | object>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export function trackMetaEvent(
  eventName: string,
  data: PixelEventData = {},
  eventId = crypto.randomUUID()
) {
  if (typeof window !== "undefined") {
    window.fbq?.("track", eventName, data, { eventID: eventId });
  }
  return eventId;
}

export function trackMetaAddToCart(contentId: string, price: number) {
  return trackMetaEvent("AddToCart", {
    content_ids: [contentId],
    content_type: "product",
    value: price,
    currency: "BDT",
    contents: [{ id: contentId, quantity: 1, item_price: price }],
  });
}

export function getMetaOrderAttribution(eventId: string) {
  const readCookie = (name: string) => {
    const cookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));
    if (!cookie) return undefined;
    const value = cookie.slice(name.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const fbc = readCookie("_fbc");
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");

  return {
    eventId,
    fbp: readCookie("_fbp"),
    fbc: fbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
    eventSourceUrl: window.location.href,
  };
}

export function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelRouteTracker />
    </Suspense>
  );
}

function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const route = `${pathname}?${searchParams.toString()}`;
  const previousRoute = useRef<string | null>(null);

  useEffect(() => {
    if (previousRoute.current === null) {
      previousRoute.current = route;
      return;
    }
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    trackMetaEvent("PageView");
  }, [route]);

  return null;
}

export function MetaPixelEvent({
  eventName,
  eventKey,
  data,
}: {
  eventName: string;
  eventKey: string;
  data: PixelEventData;
}) {
  const lastEventKey = useRef<string | null>(null);
  const serializedData = JSON.stringify(data);

  useEffect(() => {
    if (!pixelId || lastEventKey.current === eventKey) return;
    lastEventKey.current = eventKey;
    trackMetaEvent(eventName, JSON.parse(serializedData) as PixelEventData);
  }, [eventKey, eventName, serializedData]);

  return null;
}