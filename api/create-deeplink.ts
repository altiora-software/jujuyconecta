import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(
  process.env.SUPA_URL as string,
  process.env.SUPA_SERVICE_ROLE_KEY as string
);

// CORS: no hardcodees localhost y listo, o te vas a pegar un tiro en prod.
// Permití una lista. Ej: "http://localhost:8080,https://jujuyconecta.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:8080")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string) {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}

function isISODate(s?: string) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function toInt(n: unknown, def: number) {
  const x = Number(n);
  return Number.isFinite(x) && x >= 0 ? Math.floor(x) : def;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  // CORS
  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin as string);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const BOOKING_AID = process.env.BOOKING_AID;
    if (!BOOKING_AID) return res.status(500).json({ error: "Missing BOOKING_AID" });

    const {
      hotel_id,
      session_id,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      lang,
    } = req.body ?? {};

    if (!hotel_id || !session_id) {
      return res.status(400).json({ error: "hotel_id and session_id are required" });
    }

    const ci = isISODate(checkin) ? checkin : undefined;
    const co = isISODate(checkout) ? checkout : undefined;

    // Si mandan una fecha, tienen que mandar la otra
    if ((ci && !co) || (!ci && co)) {
      return res.status(400).json({ error: "Both checkin and checkout are required together" });
    }

    const a = Math.max(1, toInt(adults, 2));
    const ch = Math.max(0, toInt(children, 0));
    const r = Math.max(1, toInt(rooms, 1));
    const l = String(lang || "es").slice(0, 5);

    // Traer booking_url del hotel
    const { data: hotel, error: hotelErr } = await supa
      .from("hotels")
      .select("id, booking_url")
      .eq("id", hotel_id)
      .single();

    if (hotelErr || !hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    if (!hotel.booking_url) {
      return res.status(400).json({ error: "Hotel missing booking_url" });
    }

    // Armar deeplink (MVP: sin inventario real, solo deep link con fechas)
    const url = new URL(hotel.booking_url);
    url.searchParams.set("aid", BOOKING_AID);
    url.searchParams.set("lang", l);

    if (ci && co) {
      url.searchParams.set("checkin", ci);
      url.searchParams.set("checkout", co);
      url.searchParams.set("group_adults", String(a));
      url.searchParams.set("group_children", String(ch));
      url.searchParams.set("no_rooms", String(r));
    }

    const deeplinkUrl = url.toString();
    const userAgent = (req.headers["user-agent"] as string) ?? null;

    // Log click en Supabase
    const { data: click, error: clickErr } = await supa
      .from("outbound_clicks")
      .insert({
        hotel_id,
        provider: "booking",
        session_id,
        checkin: ci ?? null,
        checkout: co ?? null,
        adults: a,
        children: ch,
        rooms: r,
        deeplink_url: deeplinkUrl,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (clickErr || !click) {
      console.error("Supabase click insert error:", clickErr);
      return res.status(500).json({ error: "Failed to log click" });
    }

    return res.status(200).json({
      click_id: click.id,
      deeplink_url: deeplinkUrl,
    });
  } catch (err) {
    console.error("api/create-deeplink error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
