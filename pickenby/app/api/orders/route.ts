import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { customerName, phone, address } = body;
  if (
    typeof customerName !== "string" ||
    customerName.trim() === "" ||
    typeof phone !== "string" ||
    phone.trim() === "" ||
    typeof address !== "string" ||
    address.trim() === ""
  ) {
    return NextResponse.json(
      { error: "Name, phone and address are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      },
      body: JSON.stringify({ data: body }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to create order", detail: text.slice(0, 300) },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}