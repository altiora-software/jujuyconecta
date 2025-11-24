import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type TourismPlace = Database["public"]["Tables"]["tourism_places"]["Row"];
type TourismPlaceInsert = Database["public"]["Tables"]["tourism_places"]["Insert"];
type TourismPlaceUpdate = Database["public"]["Tables"]["tourism_places"]["Update"];

export function TourismPlacesManager({ onUpdate }: { onUpdate: () => void }) {
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TourismPlace | null>(null);
  const [search, setSearch] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tourism_places")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo obtener los lugares turísticos.",
        variant: "destructive",
      });
    } else {
      setPlaces((data || []) as TourismPlace[]);
    }

    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (place: TourismPlace) => {
    setEditing(place);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("tourism_places")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el lugar.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Eliminado",
        description: "Lugar borrado correctamente.",
      });
      fetchPlaces();
      onUpdate();
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const file = fd.get("image_file") as File | null;

    let finalImageUrl: string | null = editing?.image_url || null;

    if (file && file.size > 0) {
      const bucket = "tourism-images"; // ajustá si tu bucket se llama distinto
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `places/${crypto.randomUUID()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        toast({
          title: "Error",
          description: "No se pudo subir la imagen.",
          variant: "destructive",
        });
        return;
      }

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      finalImageUrl = publicData.publicUrl;
    }

    const basePayload: Omit<TourismPlaceInsert, "id"> = {
      name: (fd.get("name") as string).trim(),
      region: (fd.get("region") as string).trim(),
      category: (fd.get("category") as string).trim(),
      description: ((fd.get("description") as string) || "").trim() || null,
      latitude: Number(fd.get("latitude")),
      longitude: Number(fd.get("longitude")),
      altitude_meters: fd.get("altitude_meters")
        ? Number(fd.get("altitude_meters"))
        : null,
      best_time_to_visit:
        ((fd.get("best_time_to_visit") as string) || "").trim() || null,
      image_url: finalImageUrl,
    };

    let error = null;

    if (editing) {
      const updatePayload: TourismPlaceUpdate = {
        ...basePayload,
      };

      const { error: err } = await supabase
        .from("tourism_places")
        // @ts-expect-error - Supabase type inference issue
        .update(updatePayload)
        .eq("id", editing.id);

      error = err;
    } else {
      const insertPayload: TourismPlaceInsert = {
        ...basePayload,
      };

      const { error: err } = await supabase
        .from("tourism_places")
        // @ts-expect-error - Supabase type inference issue
        .insert(insertPayload);

      error = err;
    }

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo guardar el lugar turístico.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Guardado",
        description: "Lugar guardado correctamente.",
      });
      setDialogOpen(false);
      form.reset();
      fetchPlaces();
      onUpdate();
    }
  };

  const filteredPlaces = useMemo(() => {
    if (!search.trim()) return places;
    const q = search.toLowerCase();
    return places.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    });
  }, [places, search]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Lugares turísticos</h2>
          <p className="text-sm text-muted-foreground">
            Gestioná los puntos clave de turismo de Jujuy. Total:{" "}
            <span className="font-semibold">{places.length}</span> lugares.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar por nombre, región o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={openNew} className="w-full sm:w-auto">
            Nuevo lugar
          </Button>
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-dashed">
              <CardHeader>
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-24 w-full bg-muted rounded-md animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
          No se encontraron lugares con ese criterio. Probá limpiar el buscador
          o cargá un nuevo lugar turístico.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPlaces.map((p) => (
            <Card key={p.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg line-clamp-2">
                  {p.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex-1 flex flex-col">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Región:</span> {p.region}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Categoría:</span> {p.category}
                </p>

                {p.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-3">
                    {p.description}
                  </p>
                )}

                {(p.latitude || p.longitude) && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                    <span className="font-semibold">Coordenadas:</span>{" "}
                    {p.latitude?.toFixed(5)}, {p.longitude?.toFixed(5)}
                    {p.altitude_meters != null &&
                      ` · ${p.altitude_meters} msnm`}
                  </p>
                )}

                {p.image_url && (
                  <div className="mt-2">
                    <img
                      src={p.image_url}
                      alt={p.name || "Lugar turístico"}
                      className="w-full h-32 sm:h-36 object-cover rounded-md border"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-3 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(p)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(p.id)}
                  >
                    Borrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogo de alta / edición */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editing ? "Editar lugar turístico" : "Nuevo lugar turístico"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                name="name"
                defaultValue={editing?.name || ""}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Región</Label>
                <Input
                  name="region"
                  defaultValue={editing?.region || ""}
                  required
                  placeholder="Valles, Quebrada, Puna, Yungas..."
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input
                  name="category"
                  defaultValue={editing?.category || ""}
                  required
                  placeholder="Mirador, sendero, museo, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                name="description"
                defaultValue={editing?.description || ""}
                rows={3}
                placeholder="Breve descripción del lugar, qué lo hace especial, qué se puede hacer..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input
                  name="latitude"
                  type="number"
                  step="0.000001"
                  required
                  defaultValue={editing?.latitude ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input
                  name="longitude"
                  type="number"
                  step="0.000001"
                  required
                  defaultValue={editing?.longitude ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Altitud (m)</Label>
                <Input
                  name="altitude_meters"
                  type="number"
                  defaultValue={editing?.altitude_meters ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Mejor época para visitar</Label>
                <Input
                  name="best_time_to_visit"
                  defaultValue={editing?.best_time_to_visit ?? ""}
                  placeholder="Todo el año, verano, invierno..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen del lugar</Label>
              {editing?.image_url && (
                <p className="text-xs text-muted-foreground">
                  Imagen actual:{" "}
                  <a
                    href={editing.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    ver
                  </a>
                </p>
              )}
              <Input name="image_file" type="file" accept="image/*" />
              <p className="text-xs text-muted-foreground">
                Si no seleccionás un archivo, se mantiene la imagen actual.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
