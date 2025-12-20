// src/types/tourism.ts
export interface TourismPlace {
    id: string;
    name: string;
    region: string;
    category: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    altitude_meters: number | null;
    best_time_to_visit: string | null;
    image_url: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  }
  
  export interface TourismRoute {
    id: string;
    name: string;
    difficulty: "facil" | "media" | "dificil" | null;
    duration_hours: number | null;
    distance_km: number | null;
    short_description: string | null;
    long_description: string | null;
    start_municipality: string | null;
    end_municipality: string | null;
  }
  
  export interface TourismEvent {
    id: string;
    title: string;
    municipality: string | null;
    date: string;
    category: string | null;
    location_detail: string | null;
    price_range: string | null;
    short_description: string | null;
    external_link: string | null;
  }
  
  export type TourismTab = "places" | "map" | "routes" | "events" | "hotels";
  