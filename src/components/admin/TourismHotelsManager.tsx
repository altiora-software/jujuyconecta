import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type HotelRow = Database["public"]["Tables"]["tourism_hotels"]["Row"];
type HotelInsert = Database["public"]["Tables"]["tourism_hotels"]["Insert"];
type HotelUpdate = Database["public"]["Tables"]["tourism_hotels"]["Update"];

const HOTELS_BUCKET = "tourism-images"; // ajustá si tu bucket se llama distinto
const HOTELS_FOLDER = "tourism-hotels";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseAmenities(raw: string): string[] | null {
  const arr = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

function amenitiesToString(value: HotelRow["amenities"]) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  // por si en tu DB se guardó mal alguna vez como string
  return String(value);
}

function safeNumber(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function TourismHotelsManager({ onUpdate }: { onUpdate: () => void }) {
  const { toast } = useToast();

  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HotelRow | null>(null);

  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [regionFilter, setRegionFilter] = useState<string>("all");

  useEffect(() => {
    void fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tourism_hotels")
      .select("*")
      .order("region", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los hoteles.",
        variant: "destructive",
      });
    } else {
      setHotels((data || []) as HotelRow[]);
    }

    setLoading(false);
  };

  const regions = useMemo(() => {
    const s = new Set<string>();
    hotels.forEach((h) => {
      if (h.region) s.add(h.region);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [hotels]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hotels.filter((h) => {
      if (onlyActive && !h.active) return false;
      if (regionFilter !== "all" && (h.region || "") !== regionFilter)
        return false;

      if (!q) return true;

      const hay = [
        h.name || "",
        h.region || "",
        h.city || "",
        h.category || "",
        h.address || "",
        h.slug || "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [hotels, search, onlyActive, regionFilter]);

  const missingImageCount = useMemo(
    () => hotels.filter((h) => !h.image_url).length,
    [hotels]
  );
  const missingBookingCount = useMemo(
    () => hotels.filter((h) => !h.booking_url).length,
    [hotels]
  );

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (hotel: HotelRow) => {
    setEditing(hotel);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este hotel?")) return;

    const { error } = await supabase.from("tourism_hotels").delete().eq("id", id);

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el hotel.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Eliminado", description: "Hotel eliminado correctamente." });
    await fetchHotels();
    onUpdate();
  };

  const handleToggleActive = async (hotel: HotelRow) => {
    const patch: HotelUpdate = { active: !hotel.active };

    const { error } = await supabase
      .from("tourism_hotels")
      // @ts-expect-error - Supabase type inference issue
      .update(patch)
      .eq("id", hotel.id);

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del hotel.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "OK", description: "Estado actualizado." });
    await fetchHotels();
    onUpdate();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    const name = String(fd.get("name") || "").trim();
    if (!name) {
      toast({
        title: "Falta nombre",
        description: "El hotel necesita un nombre.",
        variant: "destructive",
      });
      return;
    }

    const slugRaw = String(fd.get("slug") || "").trim();
    const finalSlug = slugRaw ? slugRaw : slugify(name);

    const file = fd.get("image_file") as File | null;

    let finalImageUrl: string | null = editing?.image_url || null;

    // Upload opcional
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${HOTELS_FOLDER}/${finalSlug || "hotel"}-${crypto.randomUUID()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(HOTELS_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.log(uploadError);
        console.error(uploadError);
        toast({
          title: "Error",
          description: "No se pudo subir la imagen.",
          variant: "destructive",
        });
        return;
      }

      const { data: publicData } = supabase.storage
        .from(HOTELS_BUCKET)
        .getPublicUrl(uploadData.path);

      finalImageUrl = publicData.publicUrl;
    }

    const amenitiesRaw = String(fd.get("amenities") || "").trim();

    const basePayload: Omit<HotelInsert, "id"> = {
      name,
      slug: finalSlug || null,
      region: String(fd.get("region") || "").trim() || null,
      city: String(fd.get("city") || "").trim() || null,
      address: String(fd.get("address") || "").trim() || null,
      latitude: safeNumber(fd.get("latitude")),
      longitude: safeNumber(fd.get("longitude")),
      stars: safeNumber(fd.get("stars")),
      category: String(fd.get("category") || "").trim() || null,
      description: String(fd.get("description") || "").trim() || null,
      amenities: amenitiesRaw ? parseAmenities(amenitiesRaw) : null,
      phone: String(fd.get("phone") || "").trim() || null,
      whatsapp: String(fd.get("whatsapp") || "").trim() || null,
      website: String(fd.get("website") || "").trim() || null,
      booking_url: String(fd.get("booking_url") || "").trim() || null,
      image_url: finalImageUrl,
      active: Boolean(fd.get("active")),
    };

    let error = null;

    if (editing) {
      const updatePayload: HotelUpdate = { ...basePayload };
        console.log('voy a actualizar')
      const { error: err } = await supabase
        .from("tourism_hotels")
        // @ts-expect-error - Supabase type inference issue
        .update(updatePayload)
        .eq("id", editing.id);

      error = err;
    } else {
      const insertPayload: HotelInsert = { ...basePayload };

      const { error: err } = await supabase
        .from("tourism_hotels")
        // @ts-expect-error - Supabase type inference issue
        .insert(insertPayload);

      error = err;
    }

    if (error) {
      console.log(error);
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo guardar el hotel.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Guardado", description: "Hotel guardado correctamente." });
    setDialogOpen(false);
    formEl.reset();
    setEditing(null);
    await fetchHotels();
    onUpdate();
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold">Hoteles</h2>
          <p className="text-sm text-muted-foreground">
            Gestioná alojamientos. Total:{" "}
            <span className="font-semibold">{hotels.length}</span>
            {" · "}
            <span className={missingImageCount ? "font-semibold" : ""}>
              sin imagen: {missingImageCount}
            </span>
            {" · "}
            <span className={missingBookingCount ? "font-semibold" : ""}>
              sin booking: {missingBookingCount}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar por nombre, región, ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={openNew} className="w-full sm:w-auto">
            Nuevo hotel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Label>Región</Label>
          <select
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Switch checked={onlyActive} onCheckedChange={(v) => setOnlyActive(!!v)} />
          <span className="text-sm">Solo activos</span>
        </div>

        <div className="sm:ml-auto flex items-end">
          <Button variant="outline" onClick={fetchHotels} className="w-full sm:w-auto">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Listado en cards, igual que tourism_places */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-dashed">
              <CardHeader>
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="h-24 w-full bg-muted rounded-md animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
          No se encontraron hoteles con ese criterio.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((h) => (
            <Card key={h.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg line-clamp-2">
                    {h.name}
                  </CardTitle>
                  <Badge variant={h.active ? "default" : "secondary"} className="shrink-0">
                    {h.active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 flex-1 flex flex-col">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Región:</span> {h.region || "-"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Ciudad:</span> {h.city || "-"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Categoría:</span> {h.category || "-"}
                </p>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Estrellas:</span>{" "}
                  {h.stars != null ? h.stars : "-"}
                </p>

                {h.address && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    <span className="font-semibold">Dirección:</span> {h.address}
                  </p>
                )}

                {h.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-3">
                    {h.description}
                  </p>
                )}

                {(h.latitude != null || h.longitude != null) && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    <span className="font-semibold">Coords:</span>{" "}
                    {h.latitude ?? "-"}, {h.longitude ?? "-"}
                  </p>
                )}

                {h.image_url ? (
                  <div className="mt-2">
                    <img
                      src={h.image_url}
                      alt={h.name || "Hotel"}
                      className="w-full h-32 sm:h-36 object-cover rounded-md border"
                    />
                  </div>
                ) : (
                  <div className="mt-2 border rounded-md p-3 text-xs text-muted-foreground">
                    Falta imagen
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-3 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[110px]"
                    onClick={() => openEdit(h)}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[110px]"
                    onClick={() => handleToggleActive(h)}
                  >
                    {h.active ? "Desactivar" : "Activar"}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 min-w-[110px]"
                    onClick={() => handleDelete(h.id)}
                  >
                    Borrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog alta / edición */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editing ? "Editar hotel" : "Nuevo hotel"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input name="name" defaultValue={editing?.name || ""} required />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                name="slug"
                defaultValue={editing?.slug || ""}
                placeholder="hotel-xibi-xibi"
              />
              <p className="text-xs text-muted-foreground">
                Si lo dejás vacío, se genera desde el nombre.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Región</Label>
                <Input
                  name="region"
                  defaultValue={editing?.region || ""}
                  placeholder="Quebrada, Valles, Yungas, Puna..."
                />
              </div>
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  name="city"
                  defaultValue={editing?.city || ""}
                  placeholder="San Salvador de Jujuy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                name="address"
                defaultValue={editing?.address || ""}
                placeholder="Calle, número, referencia..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input
                  name="latitude"
                  type="number"
                  step="0.000001"
                  defaultValue={editing?.latitude ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input
                  name="longitude"
                  type="number"
                  step="0.000001"
                  defaultValue={editing?.longitude ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Estrellas</Label>
                <Input
                  name="stars"
                  type="number"
                  min={0}
                  max={5}
                  step="1"
                  defaultValue={editing?.stars ?? ""}
                  placeholder="0 a 5"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input
                  name="category"
                  defaultValue={editing?.category || ""}
                  placeholder="Hotel, Hostal, Cabañas..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                name="description"
                defaultValue={editing?.description || ""}
                rows={3}
                placeholder="Descripción útil, corta, sin humo."
              />
            </div>

            <div className="space-y-2">
              <Label>Amenities (separados por coma)</Label>
              <Input
                name="amenities"
                defaultValue={amenitiesToString(editing?.amenities ?? null)}
                placeholder="wifi, desayuno, cochera, pileta..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  name="phone"
                  defaultValue={editing?.phone || ""}
                  placeholder="388..."
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  name="whatsapp"
                  defaultValue={editing?.whatsapp || ""}
                  placeholder="549388..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  defaultValue={editing?.website || ""}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Booking URL</Label>
                <Input
                  name="booking_url"
                  defaultValue={editing?.booking_url || ""}
                  placeholder="https://booking.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen</Label>
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

            <div className="flex items-center gap-2 pt-2">
              <Switch
                name="active"
                defaultChecked={editing ? !!editing.active : true}
              />
              <span className="text-sm">Activo (visible en la web)</span>
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
