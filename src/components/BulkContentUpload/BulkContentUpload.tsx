import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { markdownToHtml } from "@/hooks/markdownToHtml";
import { autoLinkHtml, InternalLink } from "@/hooks/autoLinkHtml";

export function BulkContentUpload() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setRows(json);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!rows.length) return;

    setLoading(true);
    try {
      // 1) Traer internal_links de Supabase
      const { data: internalLinksData, error: linksError } = await supabase
        .from("internal_links")
        .select("keyword,target_slug");

      if (linksError) {
        console.error("Error cargando internal_links:", linksError);
      }

      const internalLinks: InternalLink[] = (internalLinksData || []).map(
        (link: any) => ({
          keyword: link.keyword,
          target_slug: link.target_slug,
        })
      );

      // 2) Mapear filas del Excel a content_pages
      const mapped = rows.map((r) => {
        const rawMd = r.body_md || "";
        const baseHtml = markdownToHtml(rawMd);
        const bodyHtmlWithLinks = autoLinkHtml(baseHtml, internalLinks);

        // Manejo defensivo de schema_json: puede venir vacío string, null o ya como objeto
        let schemaJson: any = null;
        if (r.schema_json) {
          if (typeof r.schema_json === "string") {
            try {
              schemaJson = JSON.parse(r.schema_json);
            } catch (e) {
              console.warn("schema_json inválido, se guarda null:", r.schema_json);
              schemaJson = null;
            }
          } else {
            schemaJson = r.schema_json;
          }
        }

        return {
          slug: String(r.slug).trim(),
          title: String(r.title).trim(),
          subtitle: r.subtitle ? String(r.subtitle).trim() : null,
          type: r.type,
          cluster: r.cluster,
          municipio: r.municipio || null,
          category: r.category || null,
          tags: r.tags
            ? String(r.tags)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          summary: r.summary || null,
          body_md: rawMd,
          body_html: bodyHtmlWithLinks,
          schema_json: schemaJson,
          image_url: r.image_url || null,
          status: r.status || "draft",
          source: "xls_import",
          published_at: r.published_at || null,
        };
      });

      // 3) Upsert en content_pages
      const { error } = await supabase.from("content_pages").upsert(mapped, {
        onConflict: "slug",
      });

      if (error) {
        console.error(error);
        alert("Error al subir contenido");
      } else {
        alert("Contenido subido correctamente");
        setRows([]);
      }
    } catch (err) {
      console.error("Error inesperado en carga masiva:", err);
      alert("Error inesperado durante la carga masiva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex items-center gap-3">
        <Button onClick={handleUpload} disabled={loading || !rows.length}>
          {loading ? "Subiendo…" : "Subir contenido"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {rows.length ? `${rows.length} filas listas para subir` : "Ningún archivo cargado"}
        </span>
      </div>
    </div>
  );
}
