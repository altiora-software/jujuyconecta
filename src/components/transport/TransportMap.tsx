import { MapPin, Clock } from "lucide-react";

interface TransportLine {
  id: string;
  name: string;
  number: string;
  color: string;
}

interface TransportStop {
  id: string;
  line_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order_index: number;
}

interface TransportMapProps {
  lines: TransportLine[];
  stops: TransportStop[];
  selectedLineId?: string;
  onLineSelect: (lineId: string) => void;
}

export function TransportMap({ selectedLineId }: TransportMapProps) {
  return (
    <div className="w-full h-96 bg-muted rounded-lg flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
      <h3 className="text-lg font-semibold">Mapa de Transporte</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        🛠️ Estamos trabajando en esta función.  
        Pronto vas a poder ver los recorridos y paradas de colectivos en un mapa interactivo.
      </p>
      {selectedLineId && (
        <p className="text-xs text-primary font-medium">
          Línea seleccionada: {selectedLineId}
        </p>
      )}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Clock className="h-4 w-4" />
        Disponible próximamente
      </div>
    </div>
  );
}
