// scripts/generateContentBatch.mjs
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @typedef {Object} ContentSeed
 * @property {string} type
 * @property {string} cluster
 * @property {string} municipio
 * @property {string} titulo_base
 * @property {string} descripcion_base
 * @property {string} datos_clave
 */

async function generatePage(seed) {
  const prompt = `
Actuás como redactor senior especializado en SEO local para la provincia de Jujuy, Argentina.

Quiero que generes una página de contenido para mi plataforma "Jujuy Conecta".
La salida debe ser SIEMPRE un JSON válido sin comentarios, con esta estructura exacta:

{
  "slug": "",
  "title": "",
  "subtitle": "",
  "type": "",
  "cluster": "",
  "municipio": "",
  "category": "",
  "tags": [],
  "summary": "",
  "body_md": "",
  "schema_json": {},
  "image_url": ""
}

Reglas:
1. El contenido es para usuarios de Jujuy y turistas que buscan información muy práctica y clara.
2. Usa SEO local, menciona "Jujuy", "San Salvador de Jujuy" o el municipio correspondiente de forma natural.
3. Escribí el body_md en formato Markdown, con subtítulos H2 y H3, listas, negritas y texto escaneable.
4. Mínimo 800 palabras para recursos y paradas, 1200 para líneas de colectivo, 1500 para atractivos turísticos.
5. No repitas frases vacías ni relleno.
6. En "tags" incluí entre 3 y 8 tags relevantes.
7. En "schema_json" devolvé un objeto JSON con structured data apropiado según el tipo:
   - transporte_linea: BusRoute
   - transporte_parada: BusStop
   - turismo_atractivo: TouristAttraction
   - turismo_localidad: TouristDestination
   - turismo_ruta: TouristTrip
   - recurso (hospital): MedicalClinic
   - recurso (comisaría): PoliceStation
   - noticia: NewsArticle
   - obra: GovernmentService o Place (según corresponda)
8. "slug" debe ser un slug en minúsculas, sin acentos y con guiones.

Datos de este contenido:
- Tipo de contenido: ${seed.type}
- Cluster: ${seed.cluster}
- Municipio: ${seed.municipio}
- Título base: ${seed.titulo_base}
- Descripción base: ${seed.descripcion_base}
- Datos clave:
${seed.datos_clave}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1", // ajustá al modelo que uses
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error("Error parseando JSON. Respuesta del modelo:\n", raw);
    throw e;
  }
}

async function main() {
  const inputPath = path.join(__dirname, "input.json");
  const outputPath = path.join(__dirname, "output.json");

  if (!process.env.OPENAI_API_KEY) {
    console.error("Falta OPENAI_API_KEY en el entorno.");
    process.exit(1);
  }

  /** @type {ContentSeed[]} */
  const seeds = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const results = [];

  for (const seed of seeds) {
    console.log("Generando contenido para:", seed.titulo_base);
    const page = await generatePage(seed);
    results.push(page);
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");
  console.log("Listo. Guardado en", outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
