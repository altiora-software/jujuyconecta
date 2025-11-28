// api/send-push.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

const supa = createClient(
  process.env.SUPA_URL as string,
  process.env.SUPA_SERVICE_ROLE_KEY as string
);

const ALLOWED_ORIGIN = "http://localhost:8080";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY as string;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT as string;

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

type ChannelKey =
  | "portal_noticias"
  | "agenda_comunitaria"
  | "marketplace_local"
  | "alertas_seguridad"
  | "cursos_talleres"
  | "mapa_turistico"
  | "rutas_recorridos"
  | "eventos_turisticos"
  | "recursos_sociales"
  | "transporte_mapas"
  | "bolsa_trabajo_local";

type SendPushBody = {
  channel: ChannelKey;
  title: string;
  body: string;
  url?: string;
};

function subscriptionFromRow(row: any) {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // esto debería estar protegido, solo backend, cron o n8n
  const body = req.body as SendPushBody;

  if (!body?.channel || !body.title || !body.body) {
    return res.status(400).json({ error: "Missing channel, title or body" });
  }

  try {
    // 1) usuarios que quieren ese canal
    const { data: prefs, error: prefsError } = await supa
      .from("notification_preferences")
      .select("user_id")
      .eq("global_enabled", true)
      .eq("accepted_notifications", true)
      .eq(body.channel, true);

    if (prefsError) {
      console.error("Error fetching preferences for push", prefsError);
      return res.status(500).json({ error: "Error fetching preferences" });
    }

    if (!prefs || prefs.length === 0) {
      return res.status(200).json({ sent: 0, message: "No users subscribed for this channel" });
    }

    const userIds = prefs.map((p) => p.user_id);

    // 2) suscripciones push de esos usuarios
    const { data: subs, error: subsError } = await supa
      .from("notification_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (subsError) {
      console.error("Error fetching subscriptions", subsError);
      return res.status(500).json({ error: "Error fetching subscriptions" });
    }

    if (!subs || subs.length === 0) {
      return res.status(200).json({ sent: 0, message: "No active subscriptions" });
    }

    const payload = JSON.stringify({
      title: body.title,
      body: body.body,
      url: body.url ?? "/",
    });

    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      subs.map(async (row) => {
        const subscription = subscriptionFromRow(row);

        try {
          await webPush.sendNotification(subscription as any, payload);
          successCount++;
        } catch (err: any) {
          console.error("Error sending push to endpoint", row.endpoint, err?.statusCode);
          failCount++;

          if (err?.statusCode === 410 || err?.statusCode === 404) {
            // endpoint vencido, limpiar
            await supa
              .from("notification_subscriptions")
              .delete()
              .eq("id", row.id);
          }
        }
      })
    );

    return res.status(200).json({
      sent: successCount,
      failed: failCount,
      totalSubscriptions: subs.length,
    });
  } catch (err) {
    console.error("api/send-push error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
