// src/utils/markdownToHtml.ts
import { marked } from "marked";

// Si querés sanitizar en serio, podes sumar DOMPurify con JSDOM en backend o en un worker.
// Por ahora te dejo la versión directa.
export function markdownToHtml(md: string): string {
  if (!md) return "";
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  const html = marked.parse(md) as string;

  // Opcional: pequeños ajustes típicos para tu diseño
  return html
    .replace(/<table/g, '<table class="table-auto w-full border-collapse"')
    .replace(/<img/g, '<img loading="lazy" decoding="async"');
}
