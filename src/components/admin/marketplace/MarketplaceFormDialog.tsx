// src/components/admin/marketplace/MarketplaceFormDialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus } from "lucide-react";
import type { FormState, LocalBusiness } from "./types";
import { BUSINESS_TYPES, emptyFormState } from "./types";

interface MarketplaceFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingBusiness: LocalBusiness | null;
  formData: FormState;
  setFormData: (data: FormState) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onReset: () => void;
}

export function MarketplaceFormDialog({
  open,
  setOpen,
  editingBusiness,
  formData,
  setFormData,
  onSubmit,
  onReset,
}: MarketplaceFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          onReset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            onReset();
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {editingBusiness ? "Editar Emprendimiento" : "Nuevo Emprendimiento"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {editingBusiness
              ? "Modificá los datos de la ficha"
              : "Completá los datos del emprendimiento local"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Emprendimiento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Panadería La Esquina"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Rubro / Categoría *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Gastronomía, Ropa, Servicios, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio *</Label>
              <Input
                id="municipality"
                value={formData.municipality}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    municipality: e.target.value,
                  })
                }
                placeholder="San Salvador de Jujuy, Palpalá, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Calle, número, barrio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp: e.target.value,
                  })
                }
                placeholder="Ej: 5493884123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Teléfono fijo u otro número"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="has_delivery">¿Tiene delivery / envío?</Label>
              <Select
                value={formData.has_delivery}
                onValueChange={(value: "yes" | "no" | "none") =>
                  setFormData({
                    ...formData,
                    has_delivery: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No especificar</SelectItem>
                  <SelectItem value="yes">Sí, tiene envío</SelectItem>
                  <SelectItem value="no">No tiene envío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instagram: e.target.value,
                  })
                }
                placeholder="@usuario o URL completa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="ej: www.mi-emprendimiento.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Imagen principal (URL)</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  image_url: e.target.value,
                })
              }
              placeholder="Pegá aquí la URL de la imagen"
            />
            <p className="text-xs text-muted-foreground">
              Más adelante podés reemplazar esto por un uploader real de Supabase Storage.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags / etiquetas (separadas por coma)</Label>
            <Textarea
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="ej: pan casero, desayuno, sin tacc"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitude: e.target.value,
                  })
                }
                placeholder="-24.1858"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitud</Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitude: e.target.value,
                  })
                }
                placeholder="-65.2995"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_type">Fuente / Origen de datos</Label>
              <Input
                id="source_type"
                value={formData.source_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source_type: e.target.value,
                  })
                }
                placeholder="Google Maps, Instagram, carga manual, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_url">URL de la fuente</Label>
            <Input
              id="source_url"
              value={formData.source_url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  source_url: e.target.value,
                })
              }
              placeholder="Link a la ficha de Maps, IG, etc."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="flex-1">
              {editingBusiness ? "Actualizar" : "Crear"} ficha
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
