// src/pages/ContentPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";

interface ContentPage {
  slug: string;
  title: string;
  subtitle?: string;
  body_html: string;
  cluster: string;
  type: string;
  municipio?: string;
  image_url?: string;
  schema_json?: any;
  published_at?: string;
  tags?: string[];
}

export default function ContentPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPage = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!error && data) {
        setPage(data as ContentPage);
      }
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <main className="container mx-auto px-4 py-6">
          <div>Cargando…</div>
        </main>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Contenido no encontrado</h1>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <article>
          <h1 className="text-3xl font-extrabold mb-2">{page.title}</h1>
          {page.subtitle && (
            <p className="text-lg text-muted-foreground mb-4">{page.subtitle}</p>
          )}
          {page.municipio && (
            <p className="text-sm mb-2">
              Municipio: <span className="font-semibold">{page.municipio}</span>
            </p>
          )}
          {page.image_url && (
            <img
              src={page.image_url}
              alt={page.title}
              className="w-full rounded-xl mb-4 object-cover"
            />
          )}
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.body_html }}
          />
        </article>
      </main>

      {/* Structured data render */}
      {page.schema_json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(page.schema_json) }}
        />
      )}
    </Layout>
  );
}
