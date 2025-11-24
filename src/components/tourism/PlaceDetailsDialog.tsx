// src/components/tourism/PlaceDetailsDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
  } from "@/components/ui/dialog";
  import { Separator } from "@/components/ui/separator";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { MapPin, Mountain, X } from "lucide-react";
  import { TourismPlace } from "@/components/types/tourism";
  import { formatCategory } from "./utils";
  
  interface PlaceDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    place: TourismPlace | null;
    onSeeOnMap: (id: string) => void;
  }
  
  export function PlaceDetailsDialog({
    open,
    onOpenChange,
    place,
    onSeeOnMap,
  }: PlaceDetailsDialogProps) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg md:max-w-2xl p-0">
          <div className="flex flex-col max-h-[85vh]">
            {/* Header fijo con título y X */}
            <div className="flex items-start justify-between px-4 pt-4 pb-2 border-b">
              <div className="space-y-1 pr-6">
                <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Mountain className="h-4 w-4 text-primary" />
                  {place?.name || "Detalle de lugar"}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  Información ampliada del punto turístico.
                </DialogDescription>
              </div>
  
              <DialogClose asChild>
                <button
                  type="button"
                  className="p-1.5 text-muted-foreground hover:bg-muted focus:outline-none"
                >
                </button>
              </DialogClose>
            </div>
  
            {/* Cuerpo scrolleable */}
            <div className="px-4 pb-4 pt-3 overflow-y-auto space-y-4">
              {place && (
                <>
                  {/* Imagen */}
                  {place.image_url && (
                    <div className="overflow-hidden rounded-lg border bg-black/5 flex items-center justify-center max-h-[260px] md:max-h-[380px]">
                      <img
                        src={place.image_url}
                        alt={place.name}
                        className="w-full h-auto object-contain max-h-[260px] md:max-h-[380px]"
                      />
                    </div>
                  )}
  
                  {/* Meta data */}
                  <div className="flex flex-wrap gap-2 text-[11px] md:text-xs text-muted-foreground">
                    {place.region && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {place.region}
                      </span>
                    )}
  
                    <Badge variant="outline">
                      {formatCategory(place.category)}
                    </Badge>
  
                    {place.altitude_meters && (
                      <Badge variant="secondary">
                        {place.altitude_meters} msnm
                      </Badge>
                    )}
  
                    {place.best_time_to_visit && (
                      <Badge variant="secondary">
                        Mejor época: {place.best_time_to_visit}
                      </Badge>
                    )}
                  </div>
  
                  {/* Descripción */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Descripción</h4>
  
                    {place.description ? (
                      <p className="text-[13px] md:text-sm text-muted-foreground whitespace-pre-line leading-snug">
                        {place.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Próximamente vamos a sumar una descripción más completa para este lugar.
                      </p>
                    )}
                  </div>
  
                  {/* Cómo llegar */}
                  {place.latitude && place.longitude && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Cómo llegar</h4>
  
                      <p className="text-[11px] text-muted-foreground">
                        Google Maps va a trazar la ruta desde tu ubicación actual hasta este punto.
                      </p>
  
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSeeOnMap(place.id);
                            onOpenChange(false);
                          }}
                        >
                          Ver en mapa
                        </Button>
  
                        <Button size="sm" asChild>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=driving`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Cómo llegar
                          </a>
                        </Button>
                      </div>
  
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Coordenadas: {place.latitude.toFixed(4)},{" "}
                        {place.longitude.toFixed(4)}
                      </p>
                    </div>
                  )}
  
                  <Separator />
  
                  {/* Transporte público cercano (placeholder) */}
                  <div className="space-y-2 pb-1">
                    <h4 className="text-sm font-semibold">
                      Transporte público cercano
                    </h4>
                    <p className="text-[11px] md:text-xs text-muted-foreground leading-snug">
                      Muy pronto vas a ver acá las líneas de colectivo que te dejan cerca de este punto,
                      integradas con la sección de Transporte.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  