// src/components/marketplace/NewBusinessDialog.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type MarketplaceBusinessRequestInsert = {
  business_name: string;
  category: string | null;
  municipality: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  instagram: string | null;
  description: string | null;
  source_url: string | null;
};

interface NewBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // por si después querés refrescar la lista automáticamente
  onSubmitted?: () => void;
}

export function NewBusinessDialog({
  open,
  onOpenChange,
  onSubmitted,
}: NewBusinessDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    category: "",
    municipality: "",
    address: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    instagram: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (submitting) return;
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.business_name.trim()) {
      toast({
        title: "Falta el nombre del emprendimiento",
        description: "Por favor ingresá al menos el nombre.",
        variant: "destructive",
      });
      return;
    }

    if (!form.contact_phone.trim() && !form.contact_email.trim()) {
      toast({
        title: "Falta un dato de contacto",
        description:
          "Dejanos al menos un teléfono o un correo para poder responderte.",
        variant: "destructive",
      });
      return;
    }

    const payload: MarketplaceBusinessRequestInsert = {
      business_name: form.business_name.trim(),
      category: form.category.trim() || null,
      municipality: form.municipality.trim() || null,
      address: form.address.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      instagram: form.instagram.trim() || null,
      description: form.description.trim() || null,
      source_url:
        typeof window !== "undefined" ? window.location.href : null,
    };

    try {
      setSubmitting(true);

      const { error } = await (supabase as any)
        .from("marketplace_business_requests")
        .insert([payload]);

      if (error) {
        console.error("Error guardando solicitud de emprendimiento", error);
        toast({
          title: "No pudimos guardar tu solicitud",
          description:
            "Ocurrió un error al enviar el formulario. Probá de nuevo en unos minutos.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Solicitud enviada",
        description:
          "Guardamos tu emprendimiento para revisión. Te vamos a contactar por los datos que dejaste.",
      });

      setForm({
        business_name: "",
        category: "",
        municipality: "",
        address: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        instagram: "",
        description: "",
      });

      onOpenChange(false);
      onSubmitted?.();
    } catch (err) {
      console.error("Error inesperado guardando emprendimiento", err);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un problema al enviar el formulario.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[92%] 
          max-w-md 
          rounded-xl 
          p-6 
          md:p-8 
          max-h-[90vh] 
          overflow-y-auto
        "
      >
        <DialogHeader className="space-y-1 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Sumar mi emprendimiento
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Completá estos datos básicos y vamos a revisar tu ficha para sumarla
            al Marketplace de Jujuy Conecta.
          </DialogDescription>
        </DialogHeader>
  
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* nombre */}
          <div className="space-y-1">
            <Label htmlFor="business_name">Nombre del emprendimiento*</Label>
            <Input
              id="business_name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              required
            />
          </div>
  
          {/* rubro + municipio */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="category">Rubro / categoría</Label>
              <Input
                id="category"
                name="category"
                placeholder="Panadería, ropa, diseño..."
                value={form.category}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="municipality">Municipio / localidad</Label>
              <Input
                id="municipality"
                name="municipality"
                placeholder="San Salvador, Palpalá..."
                value={form.municipality}
                onChange={handleChange}
              />
            </div>
          </div>
  
          {/* dirección */}
          <div className="space-y-1">
            <Label htmlFor="address">Dirección (si aplica)</Label>
            <Input
              id="address"
              name="address"
              placeholder="Calle y número, barrio..."
              value={form.address}
              onChange={handleChange}
            />
          </div>
  
          {/* contacto */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="contact_phone">WhatsApp o teléfono*</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                placeholder="+54 9 388 ..."
                value={form.contact_phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact_email">Correo de contacto</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.contact_email}
                onChange={handleChange}
              />
            </div>
          </div>
  
          {/* nombre de contacto */}
          <div className="space-y-1">
            <Label htmlFor="contact_name">Tu nombre</Label>
            <Input
              id="contact_name"
              name="contact_name"
              placeholder="Quién está a cargo del emprendimiento"
              value={form.contact_name}
              onChange={handleChange}
            />
          </div>
  
          {/* instagram */}
          <div className="space-y-1">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              placeholder="@miemprendimiento o link"
              value={form.instagram}
              onChange={handleChange}
            />
          </div>
  
          {/* descripción */}
          <div className="space-y-1">
            <Label htmlFor="description">¿Qué ofrecés?</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Contanos brevemente qué productos o servicios ofrecés..."
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </div>
  
          {/* botones */}
          <div className="pt-3 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="sm:min-w-[120px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="sm:min-w-[160px]"
            >
              {submitting ? "Enviando..." : "Enviar para revisión"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );  
}
