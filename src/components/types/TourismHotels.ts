export type TourismTab = "places" | "map" | "routes" | "events" | "hotels";

export type TourismHotel = {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  stars: number | null;
  category: string | null;
  description: string | null;
  amenities: string[] | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  image_url: string | null;
  booking_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};
