// src/utils/autoLinkHtml.ts

export interface InternalLink {
    keyword: string;
    target_slug: string;
  }
  
  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  
  /**
   * Autolink muy simple:
   * - Reemplaza la primera aparición de cada keyword por un <a>
   * - No distingue mayúsculas/minúsculas
   * Importante: esto es suficiente para empezar, si más adelante ves que pisa HTML complejo,
   * lo refinamos con un parser.
   */
  export function autoLinkHtml(
    html: string,
    links: InternalLink[],
    basePath = ""
  ): string {
    if (!html || !links.length) return html;
  
    let processed = html;
  
    for (const link of links) {
      if (!link.keyword || !link.target_slug) continue;
  
      const escaped = escapeRegExp(link.keyword);
      const regex = new RegExp(`(?![^<]*>)\\b(${escaped})\\b`, "i");
  
      const href = basePath
        ? `${basePath.replace(/\/$/, "")}/${link.target_slug}`
        : `/${link.target_slug}`;
  
      const anchor = `<a href="${href}" class="text-blue-400 underline">$1</a>`;
  
      // solo primera coincidencia por keyword para no sobre-enlazar
      processed = processed.replace(regex, anchor);
    }
  
    return processed;
  }
  