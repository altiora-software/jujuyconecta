import { useToast } from "@/hooks/use-toast";
import { LocalBusiness } from "../admin/marketplace/types";

const JUJUY_CONECTA_WHATSAPP = "54388XXXXXXXX"; // TODO: poné acá el número real

// OJO, version corregida del slug
const buildBusinessSlug = (item: LocalBusiness) => {
  const nameSlug = item.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${nameSlug}-${item.id}`;
};


const buildBusinessUrl = (item: LocalBusiness) => {
  if (typeof window === "undefined") return "";
  const base = `${window.location.origin}/servicios/marketplace/emprendimientos`;
  return `${base}/${buildBusinessSlug(item)}`;
};

export const buildEditRequestWhatsApp = (item: LocalBusiness) => {
  const url = buildBusinessUrl(item);
  const text = encodeURIComponent(
    `Hola, quiero actualizar los datos de mi emprendimiento en el Marketplace de Jujuy Conecta.\n\n` +
      `Nombre: ${item.name}\n` +
      `ID: ${item.id}\n` +
      `Link de la ficha: ${url}\n\n` +
      `Cambios que necesito:\n- `
  );
  return `https://wa.me/${JUJUY_CONECTA_WHATSAPP}?text=${text}`;
};

export const buildNewListingWhatsApp = () => {
  const text = encodeURIComponent(
    `Hola, quiero sumar mi emprendimiento al Marketplace de Jujuy Conecta.\n\n` +
      `Te dejo mis datos para la ficha:\n` +
      `- Nombre del emprendimiento:\n` +
      `- Rubro / categoría:\n` +
      `- Municipio / barrio:\n` +
      `- Dirección (si aplica):\n` +
      `- WhatsApp de contacto:\n` +
      `- Instagram / web:\n` +
      `- ¿Qué ofrezco? (breve descripción):\n`
  );
  return `https://wa.me/${JUJUY_CONECTA_WHATSAPP}?text=${text}`;
};

export const shareBusiness = async (item: LocalBusiness, toast: ReturnType<typeof useToast>["toast"]) => {
  const url = buildBusinessUrl(item);
  const title = item.name;
  const text = `Mirá este emprendimiento jujeño en el Marketplace de Jujuy Conecta: ${item.name}`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch {
      await navigator.clipboard?.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "Copiamos el link del emprendimiento para que lo pegues donde quieras.",
      });
    }
  } else {
    await navigator.clipboard?.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "Copiamos el link del emprendimiento para que lo pegues donde quieras.",
    });
  }
};
