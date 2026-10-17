const crypto = require("crypto");

const sha = (value) =>
  value
    ? crypto
        .createHash("sha256")
        .update(String(value).trim().toLowerCase())
        .digest("hex")
    : undefined;

const bdPhone = (value) => {
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("0")) digits = `88${digits}`;
  if (!digits.startsWith("880")) digits = `880${digits}`;
  return digits;
};

const hashedField = (value) => {
  const hash = sha(value);
  return hash ? [hash] : undefined;
};

const calculateOrderTotal = (items) =>
  items.reduce((total, item) => {
    const price = Number(item.price);
    const quantity = Number(item.qty ?? item.quantity ?? 1);
    if (!Number.isFinite(price)) return total;
    return total + price * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
  }, 0);

module.exports = {
  async beforeUpdate(event) {
    const data = event.params.data;
    if (Array.isArray(data.items)) data.total = calculateOrderTotal(data.items);
  },

  async afterCreate(event) {
    const order = event.result;
    const pixelId = process.env.FB_PIXEL_ID;
    const accessToken = process.env.FB_CAPI_TOKEN;
    if (!pixelId || !accessToken) {
      strapi.log.warn("Meta CAPI skipped: FB_PIXEL_ID or FB_CAPI_TOKEN is missing.");
      return;
    }

    const request = strapi.requestContext.get()?.request;
    const forwardedFor = request?.headers?.["x-forwarded-for"];
    const ip = forwardedFor
      ? String(forwardedFor).split(",")[0].trim()
      : request?.ip;
    const userAgent = request?.headers?.["user-agent"];
    const items = Array.isArray(order.items)
      ? order.items.filter((item) => item && typeof item === "object")
      : [];
    const [firstName, ...lastName] = String(order.customerName || "").trim().split(/\s+/);
    const phone = bdPhone(order.phone);
    const itemContents = items
      .map((item) => {
        const id = String(item.slug ?? item.id ?? "");
        if (!id) return null;
        const quantity = Number(item.qty ?? item.quantity ?? 1);
        const price = Number(item.price);
        return {
          id,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          ...(Number.isFinite(price) ? { item_price: price } : {}),
        };
      })
      .filter(Boolean);

    const userData = {
      country: hashedField("bd"),
      ph: hashedField(phone),
      external_id: hashedField(phone),
      fn: hashedField(firstName),
      ln: hashedField(lastName.join(" ")),
      ct: hashedField(String(order.city || "").replace(/\s/g, "")),
      st: hashedField(String(order.division || "").replace(/\s/g, "")),
      ...(ip ? { client_ip_address: ip } : {}),
      ...(userAgent ? { client_user_agent: userAgent } : {}),
      ...(order.fbp ? { fbp: order.fbp } : {}),
      ...(order.fbc ? { fbc: order.fbc } : {}),
    };
    for (const key of Object.keys(userData)) {
      if (userData[key] === undefined) delete userData[key];
    }

    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: order.eventId || String(order.id),
          action_source: "website",
          event_source_url: order.eventSourceUrl || "https://pickenby.com",
          user_data: userData,
          custom_data: {
            currency: "BDT",
            value: Number(order.total) || 0,
            content_type: "product",
            content_ids: itemContents.map((item) => item.id),
            contents: itemContents,
            num_items: itemContents.reduce((sum, item) => sum + item.quantity, 0),
          },
        },
      ],
      test_event_code: process.env.FB_TEST_EVENT_CODE || undefined,
    };

    try {
      const url = new URL(`https://graph.facebook.com/v23.0/${encodeURIComponent(pixelId)}/events`);
      url.searchParams.set("access_token", accessToken);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        strapi.log.warn(`Meta CAPI Purchase failed (${response.status}): ${JSON.stringify(result)}`);
        return;
      }
      strapi.log.info(`Meta CAPI Purchase sent: ${JSON.stringify(result)}`);
    } catch (error) {
      strapi.log.error(`Meta CAPI error: ${error.message}`);
    }
  },
};