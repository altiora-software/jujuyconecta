// src/components/admin/marketplace/MarketplaceManager.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import type { LocalBusiness, FormState } from "./marketplace/types";
import { emptyFormState } from "./marketplace/types";
import { MarketplaceFormDialog } from "./marketplace/MarketplaceFormDialog";
import { MarketplaceListMobile } from "./marketplace/MarketplaceListMobile";
import { MarketplaceTableDesktop } from "./marketplace/MarketplaceTableDesktop";

interface MarketplaceManagerProps {
  onUpdate?: () => void;
}

export const MarketplaceManager = ({ onUpdate }: MarketplaceManagerProps) => {
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<LocalBusiness | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyFormState);

  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from("local_businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBusinesses((data || []) as LocalBusiness[]);
    } catch (error) {
      console.error("Error fetching local_businesses:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los emprendimientos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyFormState);
    setEditingBusiness(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const hasDeliveryValue =
        formData.has_delivery === "yes"
          ? true
          : formData.has_delivery === "no"
          ? false
          : "none";

      const latitudeValue =
        formData.latitude.trim() !== "" ? parseFloat(formData.latitude) : null;
      const longitudeValue =
        formData.longitude.trim() !== "" ? parseFloat(formData.longitude) : null;

      const businessData = {
        name: formData.name,
        category: formData.category,
        type: formData.type,
        municipality: formData.municipality,
        address: formData.address || null,
        whatsapp: formData.whatsapp || null,
        phone: formData.phone || null,
        instagram: formData.instagram || null,
        website: formData.website || null,
        image_url: formData.image_url || null,
        source_url: formData.source_url || null,
        source_type: formData.source_type || null,
        tags: tagsArray.length ? tagsArray : null,
        has_delivery: hasDeliveryValue,
        latitude: latitudeValue,
        longitude: longitudeValue,
      };

      if (editingBusiness) {
        const { error } = await (supabase as any)
          .from("local_businesses")
          .update(businessData)
          .eq("id", editingBusiness.id);

        if (error) throw error;

        toast({
          title: "Emprendimiento actualizado",
          description: "La ficha del emprendimiento se actualizó correctamente",
        });
      } else {
        const { error } = await (supabase as any)
          .from("local_businesses")
          .insert([businessData]);

        if (error) throw error;

        toast({
          title: "Emprendimiento creado",
          description: "La nueva ficha se creó correctamente",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBusinesses();
      onUpdate?.();
    } catch (error) {
      console.error("Error saving local_business:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el emprendimiento",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (business: LocalBusiness) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name || "",
      category: business.category || "",
      type: business.type || "emprendimiento",
      municipality: business.municipality || "",
      address: business.address || "",
      whatsapp: business.whatsapp || "",
      phone: business.phone || "",
      instagram: business.instagram || "",
      website: business.website || "",
      image_url: business.image_url || "",
      source_url: business.source_url || "",
      source_type: business.source_type || "",
      tags: business.tags?.join(", ") || "",
      has_delivery:
        business.has_delivery === true
          ? "yes"
          : business.has_delivery === false
          ? "no"
          : "none",
      latitude:
        business.latitude !== null && business.latitude !== undefined
          ? String(business.latitude)
          : "",
      longitude:
        business.longitude !== null && business.longitude !== undefined
          ? String(business.longitude)
          : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar este emprendimiento?")) return;

    try {
      const { error } = await (supabase as any)
        .from("local_businesses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Emprendimiento eliminado",
        description: "La ficha se eliminó correctamente",
      });

      fetchBusinesses();
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting local_business:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el emprendimiento",
        variant: "destructive",
      });
    }
  };

  const toggleDelivery = async (id: string, current: boolean | null) => {
    try {
      const { error } = await (supabase as any)
        .from("local_businesses")
        .update({ has_delivery: !current })
        .eq("id", id);

      if (error) throw error;

      fetchBusinesses();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating has_delivery:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Store className="h-5 w-5" />
                Gestión de Marketplace Local
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Administrá las fichas de comercios, emprendedores y servicios de Jujuy
              </CardDescription>
            </div>

            <MarketplaceFormDialog
              open={isDialogOpen}
              setOpen={setIsDialogOpen}
              editingBusiness={editingBusiness}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onReset={resetForm}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-sm">Cargando emprendimientos...</div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Todavía no hay fichas cargadas.
            </div>
          ) : (
            <>
              <MarketplaceListMobile
                businesses={businesses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleDelivery={toggleDelivery}
              />

              <MarketplaceTableDesktop
                businesses={businesses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleDelivery={toggleDelivery}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
