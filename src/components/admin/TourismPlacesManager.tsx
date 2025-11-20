import { useState, useEffect } from "react";
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

  const { toast } = useToast();

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tourism_places")
      .select("*")
      .order("name");

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

    // archivo subido desde el input
    const file = fd.get("image_file") as File | null;

    // si se está editando y no se sube archivo nuevo, usamos la imagen existente
    let finalImageUrl: string | null = editing?.image_url || null;

    // si hay archivo nuevo, subimos a Storage y obtenemos publicUrl
    if (file && file.size > 0) {
      const bucket = "tourism-images"; // cambialo si tu bucket se llama distinto
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
      name: fd.get("name") as string,
      region: fd.get("region") as string,
      category: fd.get("category") as string,
      description: (fd.get("description") as string) || null,
      latitude: Number(fd.get("latitude")),
      longitude: Number(fd.get("longitude")),
      altitude_meters: fd.get("altitude_meters")
        ? Number(fd.get("altitude_meters"))
        : null,
      best_time_to_visit: (fd.get("best_time_to_visit") as string) || null,
      image_url: finalImageUrl,
      // created_at y updated_at los maneja Postgres
    };

    let error = null;

    if (editing) {
      const updatePayload: TourismPlaceUpdate = {
        ...basePayload,
      };

      const { error: err } = await supabase
        .from("tourism_places")
        // @ts-expect-error - Supabase type inference issue with tourism_places.update()
        .update(updatePayload)
        .eq("id", editing.id);

      error = err;
    } else {
      const insertPayload: TourismPlaceInsert = {
        ...basePayload,
      };

      const { error: err } = await supabase
        .from("tourism_places")
        // @ts-expect-error - Supabase type inference issue with tourism_places.update()
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
      fetchPlaces();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Lugares Turísticos</h2>
        <Button onClick={openNew}>Nuevo Lugar</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Región:</strong> {p.region}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Categoría:</strong> {p.category}
                </p>

                {p.image_url && (
                  <div className="mt-2">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(p)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Lugar Turístico" : "Nuevo Lugar Turístico"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <Label>Nombre</Label>
              <Input name="name" defaultValue={editing?.name || ""} required />
            </div>

            <div>
              <Label>Región</Label>
              <Input
                name="region"
                defaultValue={editing?.region || ""}
                required
              />
            </div>

            <div>
              <Label>Categoría</Label>
              <Input
                name="category"
                defaultValue={editing?.category || ""}
                required
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                name="description"
                defaultValue={editing?.description || ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitud</Label>
                <Input
                  name="latitude"
                  type="number"
                  step="0.000001"
                  required
                  defaultValue={editing?.latitude ?? ""}
                />
              </div>
              <div>
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

            <div>
              <Label>Altitud (m)</Label>
              <Input
                name="altitude_meters"
                type="number"
                defaultValue={editing?.altitude_meters ?? ""}
              />
            </div>

            <div>
              <Label>Mejor época para visitar</Label>
              <Input
                name="best_time_to_visit"
                defaultValue={editing?.best_time_to_visit ?? ""}
              />
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
              <Input
                name="image_file"
                type="file"
                accept="image/*"
              />
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
