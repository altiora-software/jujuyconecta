import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Geocodificador simple usando Nominatim
async function geocodeAddress(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "JujuyConecta/1.0 (contacto@tu-dominio.com)",
    },
  });

  if (!res.ok) {
    console.error("Error HTTP en geocoder", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;

  const first = data[0];
  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
  };
}

async function main() {
  // 1. Traer un batch de paradas sin coordenadas
  const { data: stops, error } = await supabase
    .from("transport_raw_stops")
    .select("id, direccion, address_raw, city, province, country")
    .is("latitude", null)
    .limit(50); // no seas animal, hacelo por lotes

  if (error) {
    console.error("Error cargando paradas", error);
    process.exit(1);
  }

  if (!stops || stops.length === 0) {
    console.log("No hay paradas pendientes de geocodificar");
    return;
  }

  for (const stop of stops) {
    const addressPart = stop.direccion || stop.address_raw;
    if (!addressPart) {
      console.log(`Stop ${stop.id} sin dirección utilizable, la salto`);
      continue;
    }

    const query = `${addressPart}, ${stop.city}, ${stop.province}, ${stop.country}`;
    console.log("Geocodificando:", query);

    const coords = await geocodeAddress(query);

    if (!coords) {
      console.warn("No se encontraron coords para", query);
      continue;
    }

    console.log(" →", coords.lat, coords.lon);

    const { error: updateError } = await supabase
      .from("transport_raw_stops")
      .update({
        latitude: coords.lat,
        longitude: coords.lon,
        processed: true,
      })
      .eq("id", stop.id);

    if (updateError) {
      console.error("Error actualizando parada", stop.id, updateError);
    }

    // Respetar rate limit, no seas kamikaze
    await new Promise((r) => setTimeout(r, 1200));
  }
}

main().then(() => {
  console.log("Batch de geocodificación terminado");
});
