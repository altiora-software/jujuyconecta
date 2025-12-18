export interface TransportLine {
    company_name: any;
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
  line_id: string | null;
  line_code: string;
  direction: string;
  order_index: number;

  stop_name: string;
  direccion: string | null;

  address_raw: string | null;
  city: string | null;
  province: string | null;
  country: string | null;

  latitude: number | null;
  longitude: number | null;
  precision_note: string | null;

  source: string | null;
  processed: boolean | null;

  stop_id: string | null;
  created_at: string;
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
  
  export interface IntercityRouteUI {
    id: string;
    company_name: string;        // obtenido de transport_companies
    origin_city: string;
    destination_city: string;
    notes?: string | null;
    weekday_times: string[];
    weekend_times: string[];
  }
  export interface IntercityRoute {
    id: string;
    company_id: string;
    origin_city: string;
    destination_city: string;
    notes?: string | null;
  }
  export interface IntercityCompany {
    id: string;
    name: string;
  }
  