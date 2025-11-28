// api/notification-subscriptions.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supa = createClient(
  process.env.SUPA_URL as string,
  process.env.SUPA_SERVICE_ROLE_KEY as string
);

const ALLOWED_ORIGIN = "http://localhost:8080";

type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;

  // CORS
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const {
    data: { user },
    error: userError,
  } = await supa.auth.getUser(token);

  if (userError || !user) {
    console.error("Error getting user from token", userError);
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = user.id;

  try {
    if (req.method === "POST") {
      const body = req.body as PushSubscriptionJSON;

      if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
        return res.status(400).json({ error: "Invalid subscription payload" });
      }

      const { endpoint, keys } = body;

      const { data, error } = await supa
        .from("notification_subscriptions")
        .upsert(
          {
            user_id: userId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
          {
            onConflict: "endpoint",
          }
        )
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error upserting subscription", error);
        return res.status(500).json({ error: "Error saving subscription" });
      }

      return res.status(200).json({ subscription: data });
    }

    // DELETE: baja una suscripción puntual por endpoint
    if (req.method === "DELETE") {
      const body = req.body as { endpoint?: string };

      if (!body?.endpoint) {
        return res.status(400).json({ error: "Missing endpoint" });
      }

      const { error } = await supa
        .from("notification_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", body.endpoint);

      if (error) {
        console.error("Supabase error deleting subscription", error);
        return res.status(500).json({ error: "Error deleting subscription" });
      }

      return res.status(200).json({ success: true });
    }
  } catch (err) {
    console.error("api/notification-subscriptions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
