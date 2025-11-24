export interface TransportLine {
    id: string;
    name: string;
    number: string;
    color: string;
    route_description: string | null;
    active: boolean;
  }
  
  export interface TransportStop {
    id: string;
    line_id: string;
    name: string;
    latitude: number;
    longitude: number;
    order_index: number;
  }
  
  export interface TransportRawStop {
    id: string;
    line_id: string;
    direction: string;
    order_index: number;
    stop_name: string;
    direccion: string | null;
    latitude: string | null;
    longitude: string | null;
  }
  
  export interface TransportReport {
    id: string;
    line_id: string;
    message: string;
    severity: "low" | "medium" | "high";
    status: "active" | "resolved" | "dismissed";
    created_at: string;
    transport_lines: TransportLine;
  }
  