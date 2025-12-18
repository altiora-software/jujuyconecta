// src/pages/servicios/MarketplaceBusiness.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { BusinessProfile, LocalBusiness } from "@/components/marketplace/BussinesProfile";

function parseIdFromSlug(slug: string): string {
    return slug.slice(-36);
  }

export default function MarketplaceBusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<LocalBusiness | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);

      try {
        const id = parseIdFromSlug(slug);
        const { data, error } = await supabase
          .from("local_businesses")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) {
          console.error("Error cargando emprendimiento", error);
          setItem(null);
        } else {
          setItem(data as LocalBusiness | null);
        }
      } catch (e) {
        console.error("Error inesperado cargando emprendimiento", e);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  return (
    <Layout>
      {loading ? (
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Cargando emprendimiento...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Estamos trayendo los datos desde el Marketplace.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : !item ? (
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Emprendimiento no encontrado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Puede que esta ficha haya sido removida o que el enlace no sea correcto.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Volver al Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <BusinessProfile item={item} />
      )}
    </Layout>
  );
}
