// src/components/admin/marketplace/types.ts

export interface LocalBusiness {
    id: string;
    name: string;
    category: string;
    type: string;
    municipality: string;
    address: string | null;
    whatsapp: string | null;
    phone: string | null;
    instagram: string | null;
    website: string | null;
    image_url: string | null;
    source_url: string | null;
    source_type: string | null;
    tags: string[] | null;
    has_delivery: boolean | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
    updated_at: string;
    is_featured?: boolean | null;
  }
  
  export const BUSINESS_TYPES = [
    { value: "producto", label: "Producto" },
    { value: "servicio", label: "Servicio" },
    { value: "emprendimiento", label: "Emprendimiento" },
  ] as const;
  
  export type FormState = {
    name: string;
    category: string;
    type: string;
    municipality: string;
    address: string;
    whatsapp: string;
    phone: string;
    instagram: string;
    website: string;
    image_url: string;
    image_file: File;
    source_url: string;
    source_type: string;
    tags: string;      // coma separada
    has_delivery: "yes" | "no" | "none"; // mapeamos a boolean/null
    latitude: string;
    longitude: string;
  };
  
  export const emptyFormState: FormState = {
    name: "",
    category: "",
    type: "emprendimiento",
    municipality: "",
    address: "",
    whatsapp: "",
    phone: "",
    instagram: "",
    website: "",
    image_url: "",
    image_file: null,
    source_url: "",
    source_type: "",
    tags: "",
    has_delivery: "none",
    latitude: "",
    longitude: "",
  };
  