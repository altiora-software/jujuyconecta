import { createClient } from "@supabase/supabase-js";

// ⚠️ Asegurate de tener estas env vars seteadas antes de correr el script
const SUPABASE_URL ="https://fxshdqjfxudvwmxvyqfq.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c2hkcWpmeHVkdndteHZ5cWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU1MDksImV4cCI6MjA3Mzk1MTUwOX0.gdA8mFTaLpA9_uLxuPGez0aVFZj-bXhAWm5g4opNQkE"


if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Geocodificador usando Nominatim (OpenStreetMap)
// Node 18+ ya tiene fetch global, no hace falta node-fetch.
async function geocodeAddress(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "JujuyConecta/1.0 (jujuyconecta@gmail.com)",
    },
  });

  if (!res.ok) {
    console.error("Error HTTP en geocoder", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0];
  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
  };
}

async function main() {
  console.log("Buscando paradas sin coordenadas...");

  const { data: stops, error } = await supabase
    .from("transport_raw_stops")
    .select("id, direccion, address_raw, city, province, country")
    .is("latitude", null)
    .limit(50); // batch chico para no matar al geocoder

  if (error) {
    console.error("Error cargando paradas", error);
    process.exit(1);
  }

  if (!stops || stops.length === 0) {
    console.log("No hay paradas pendientes de geocodificar.");
    return;
  }

  console.log(`Encontradas ${stops.length} paradas para geocodificar.`);

  for (const stop of stops) {
    const address = stop.direccion || stop.address_raw;
    if (!address) {
      console.warn(`Parada ${stop.id} sin dirección utilizable, la salto.`);
      continue;
    }

    const query = `${address}, ${stop.city}, ${stop.province}, ${stop.country}`;
    console.log(`Geocodificando: ${query}`);

    const coords = await geocodeAddress(query);

    if (!coords) {
      console.warn(`No se encontraron coordenadas para: ${query}`);
      continue;
    }

    console.log(` → lat: ${coords.lat}, lon: ${coords.lon}`);

    const { error: updateError } = await supabase
      .from("transport_raw_stops")
      .update({
        latitude: coords.lat,
        longitude: coords.lon,
        processed: true,
      })
      .eq("id", stop.id);

    if (updateError) {
      console.error(`Error actualizando parada ${stop.id}`, updateError);
    }

    // Respetar rate limit de Nominatim
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log("Batch de geocodificación terminado.");
}

// Ejecutar
main().catch((err) => {
  console.error("Error inesperado en el script:", err);
  process.exit(1);
});
