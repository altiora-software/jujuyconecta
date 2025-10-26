import React, { useState, useMemo } from "react";
// Asumiendo que estos son los componentes de íconos que estás usando (ej. lucide-react)
import { MapPin, Clock, Calendar, Tag } from 'lucide-react';
import { Layout } from "@/components/layout/Layout";

/* ---------- Estructura de Datos (Data Raw) ---------- */

const dataRaw = {
    "component": {
        "events": [
            {
                "id": "b3a0c560-52db-42ee-90bd-f728234e50df",
                "location": {
                    "name": "Culturarte Centro Cultural",
                    "address": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "28 de octubre de 2025",
                    "startTimeFormatted": "5:30 p. m.",
                },
                "title": "Taller “Artmaker” ",
                "description": "Orientado a explorar distintas técnicas de maquillaje artísticos como manifestaciones creativas de las emociones",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_8c5d16a4a5bc44bd8d03e65bfbb946ae~mv2.jpg",
                },
            },
            {
                "id": "a61a688f-27f6-43ff-8d9e-25793e2c9e56",
                "location": {
                    "name": "Culturarte Centro Cultural",
                    "address": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "28 de octubre de 2025",
                    "startTimeFormatted": "6:30 p. m.",
                },
                "title": "Taller “PeinArteSana”",
                "description": "Propuesta creativa donde se explorara el arte del peinado combinando experiencia artística y expresión personal. ",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_e5c12392026d47ca95f9a9205c0776e4~mv2.jpg",
                },
            },
            {
                "id": "2b04d0cb-05bc-43ac-9f1b-bb703deb87cc",
                "location": {
                    "name": "Django Bar",
                    "address": "Independencia 946, Y4600AFT San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Independencia 946, Y4600AFT San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "29 de octubre de 2025",
                    "startTimeFormatted": "8:00 p. m.",
                },
                "title": "Cisne Elocuente ",
                "description": "Letárgico 10 años en el éter virtual Tour 2025 (Jujuy)\n",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_48384ce53b414726b61dae951cc0feda~mv2.jpeg",
                },
            },
            {
                "id": "08fb3b5d-48e4-459b-9a52-52ae785139ae",
                "location": {
                    "name": "Rodeíto",
                    "address": "Rodeíto, Jujuy, Argentina",
                    "formattedAddress": "Rodeíto, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "30 de octubre de 2025",
                    "startTimeFormatted": "9:00 p. m.",
                },
                "title": "Concierto 40º Aniversario de la Fundación de Rodeito",
                "description": "Artistas: Camerata Ricardo Vilca | Coro IMPROMPTU",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_c2758ef7bc464cf9acc31ae2695f3a0e~mv2.jpg",
                },
            },
            {
                "id": "6e88b0e5-9c9c-4fcd-8c1a-3bf5480cf76e",
                "location": {
                    "name": "C. C. Martin Fierro - Comp. J.Hernandez ",
                    "address": "Av. Dr. Arturo Illia 451, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Av. Dr. Arturo Illia 451, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "31 de octubre de 2025",
                    "startTimeFormatted": "7:00 p. m.",
                },
                "title": "Canticuenticos en Jujuy",
                "description": "La banda que se ha ganado el corazón de miles de familias.",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_ed619b2c204242eda5b8cdb20b51dc98~mv2.jpeg",
                },
            },
            {
                "id": "08a4d568-ca61-4b86-9e37-f4733cb63ac4",
                "location": {
                    "name": "Casa De Artes Y Letras Jujuy",
                    "address": "ABY, Gral. Belgrano 1327, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "ABY, Gral. Belgrano 1327, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "31 de octubre de 2025",
                    "startTimeFormatted": "7:30 p. m.",
                },
                "title": "Presentación de Libro “El Enigma de Moai”",
                "description": "Escritor: Eduardo Enrique Ramos",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_7e226137dae84e929c1bb68c5167da2a~mv2.jpg",
                },
            },
            {
                "id": "590ee737-4fbe-4ae6-980b-91fb13ed7b6b",
                "location": {
                    "name": "San Salvador de Jujuy",
                    "address": "San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "1 de noviembre de 2025",
                    "startTimeFormatted": "7:00 p. m.",
                },
                "title": "Taller de Formación y Perfeccionamiento en Dirección Coral",
                "description": "Durante el mes de Noviembre \nCapacitador: Prof. Néstor Zadoff\n",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_844e3c2567224e67bb03da19ac403af9~mv2.jpg",
                },
            },
            {
                "id": "6f17f0a6-6524-4670-b48d-ced15b6233a3",
                "location": {
                    "name": "Teatro Mitre",
                    "address": "Gral. Alvear 1009, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Gral. Alvear 1009, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "1 de noviembre de 2025",
                    "startTimeFormatted": "9:00 p. m.",
                },
                "title": "Experiencia Dalia Gutmann – Vamos a reírnos de Nosotras.",
                "description": "Es un show de stand up",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_4e0329da435e40969c1e7eb9ecdaeba6~mv2.jpeg",
                },
            },
            {
                "id": "5ada8497-c5eb-42df-9fff-6eb87023fcfa",
                "location": {
                    "name": "Culturarte Centro Cultural",
                    "address": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "5 de noviembre de 2025",
                    "startTimeFormatted": "7:00 p. m.",
                },
                "title": "Clínica de Obra “Miradas en diálogo para proyectos en desarrollo” ",
                "description": "Entrada con Inscripción Previa~ 3884140673",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_579ca0d81ea44655a00215cf925c7dda~mv2.jpg",
                },
            },
            {
                "id": "c6db3ea1-7d77-4c5a-999b-dc2c24575603",
                "location": {
                    "name": "Casa De Artes Y Letras Jujuy",
                    "address": "ABY, Gral. Belgrano 1327, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "ABY, Gral. Belgrano 1327, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "5 de noviembre de 2025",
                    "startTimeFormatted": "7:30 p. m.",
                },
                "title": "Inauguración de la Muestra Colectiva “Pintura, Grabado y Cerámica IV”",
                "description": "La muestra permanecera hasta el 28 de noviembre y podrá visitarse de lunes a viernes de 8.00 a 20.00 Hs.",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_5ec409f948df40fd8dda837f07c80679~mv2.jpg",
                },
            },
            {
                "id": "4b414fa5-a9ba-4c75-bd38-650e3066bd11",
                "location": {
                    "name": "Culturarte Centro Cultural",
                    "address": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "General San Martín, esquina Sarmiento Y4600ADJ, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "12 de noviembre de 2025",
                    "startTimeFormatted": "7:00 p. m.",
                },
                "title": "Taller intensivo de Curaduría y Montaje para Artistas ",
                "description": "Magister: Marcelo Coca ",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_1065f12b99c449f093cb43550683e47e~mv2.jpg",
                },
            },
            {
                "id": "cb404462-900d-4108-aaa4-071956e14b65",
                "location": {
                    "name": "C. C. Martin Fierro - Comp. J.Hernandez ",
                    "address": "Av. Dr. Arturo Illia 451, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Av. Dr. Arturo Illia 451, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "14 de noviembre de 2025",
                    "startTimeFormatted": "9:30 p. m.",
                },
                "title": "Jorge Rojas en Jujuy",
                "description": "Gira 20 años",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_e94af835b0dd4979bcb3eae280907975~mv2.jpeg",
                },
            },
            {
                "id": "a4dbd822-2b27-4b39-8a68-725dde789c82",
                "location": {
                    "name": "Centro de Arte Joven Andino",
                    "address": "Gral. Alvear 534, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Gral. Alvear 534, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "15 de noviembre de 2025",
                    "startTimeFormatted": "8:00 p. m.",
                },
                "title": "Milonga del Lobo ",
                "description": "Coordina: Franco Paredes",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_66b140a88150421ba40094d2ecd2b9eb~mv2.jpg",
                },
            },
            {
                "id": "71721c86-22a5-4e93-9e71-6ea1b20a71ea",
                "location": {
                    "name": "Ciénaga de Paicone",
                    "address": "Ciénaga de Paicone, Jujuy, Argentina",
                    "formattedAddress": "Ciénaga de Paicone, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "22 de noviembre de 2025",
                    "startTimeFormatted": "7:00 p. m.",
                },
                "title": "4to Festival Binacional ",
                "description": "música autóctona, gastronomía,  artesanías y mucho más.",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_a9de3a40eb3b4b3592cd7d2d461e49a1~mv2.jpg",
                },
            },
            {
                "id": "d96232a1-8cfa-4c0e-8f5c-8100406bd2c7",
                "location": {
                    "name": "Centro de Arte Joven Andino",
                    "address": "Gral. Alvear 534, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Gral. Alvear 534, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "28 de noviembre de 2025",
                    "startTimeFormatted": "8:30 p. m.",
                },
                "title": "Luces de Milonga en CAJA ",
                "description": "Milonga organizada por CAJA.",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_6532e5aa02e24eb5adb1700684f1089a~mv2.jpg",
                },
            },
            {
                "id": "bbcac8d0-99ed-4dc2-9b0c-de2386fc0ad3",
                "location": {
                    "name": "Centro de Arte Joven Andino",
                    "address": "Gral. Alvear 534, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                    "formattedAddress": "Gral. Alvear 534, Y4600 San Salvador de Jujuy, Jujuy, Argentina",
                },
                "scheduling": {
                    "startDateFormatted": "29 de noviembre de 2025",
                    "startTimeFormatted": "8:30 p. m.",
                },
                "title": "Encuentro Coral “Noche de los Coros” ",
                "description": "Coro Consonancia (Salta) y Coro de Ciencias Económicas de Jujuy.",
                "mainImage": {
                    "url": "https://static.wixstatic.com/media/3a8282_17132fe4565a49168592afb1cb93f56f~mv2.jpg",
                },
            }
        ]
    },
    "dates": {
        "events": {
            "b4c49475-3d9b-48f8-9d5e-af1606728cca": { "startDateISOFormatNotUTC": "2025-10-03T20:00:00-03:00", "startTime": "8:00 p. m.", "startDateFormatted": "3 de octubre de 2025" },
            "b3a0c560-52db-42ee-90bd-f728234e50df": { "startDateISOFormatNotUTC": "2025-10-28T17:30:00-03:00", "startTime": "5:30 p. m.", "startDateFormatted": "28 de octubre de 2025" },
            "a61a688f-27f6-43ff-8d9e-25793e2c9e56": { "startDateISOFormatNotUTC": "2025-10-28T18:30:00-03:00", "startTime": "6:30 p. m.", "startDateFormatted": "28 de octubre de 2025" },
            "2b04d0cb-05bc-43ac-9f1b-bb703deb87cc": { "startDateISOFormatNotUTC": "2025-10-29T20:00:00-03:00", "startTime": "8:00 p. m.", "startDateFormatted": "29 de octubre de 2025" },
            "08fb3b5d-48e4-459b-9a52-52ae785139ae": { "startDateISOFormatNotUTC": "2025-10-30T21:00:00-03:00", "startTime": "9:00 p. m.", "startDateFormatted": "30 de octubre de 2025" },
            "6e88b0e5-9c9c-4fcd-8c1a-3bf5480cf76e": { "startDateISOFormatNotUTC": "2025-10-31T19:00:00-03:00", "startTime": "7:00 p. m.", "startDateFormatted": "31 de octubre de 2025" },
            "08a4d568-ca61-4b86-9e37-f4733cb63ac4": { "startDateISOFormatNotUTC": "2025-10-31T19:30:00-03:00", "startTime": "7:30 p. m.", "startDateFormatted": "31 de octubre de 2025" },
            "590ee737-4fbe-4ae6-980b-91fb13ed7b6b": { "startDateISOFormatNotUTC": "2025-11-01T19:00:00-03:00", "startTime": "7:00 p. m.", "startDateFormatted": "1 de noviembre de 2025" },
            "6f17f0a6-6524-4670-b48d-ced15b6233a3": { "startDateISOFormatNotUTC": "2025-11-01T21:00:00-03:00", "startTime": "9:00 p. m.", "startDateFormatted": "1 de noviembre de 2025" },
            "5ada8497-c5eb-42df-9fff-6eb87023fcfa": { "startDateISOFormatNotUTC": "2025-11-05T19:00:00-03:00", "startTime": "7:00 p. m.", "startDateFormatted": "5 de noviembre de 2025" },
            "c6db3ea1-7d77-4c5a-999b-dc2c24575603": { "startDateISOFormatNotUTC": "2025-11-05T19:30:00-03:00", "startTime": "7:30 p. m.", "startDateFormatted": "5 de noviembre de 2025" },
            "4b414fa5-a9ba-4c75-bd38-650e3066bd11": { "startDateISOFormatNotUTC": "2025-11-12T19:00:00-03:00", "startTime": "7:00 p. m.", "startDateFormatted": "12 de noviembre de 2025" },
            "cb404462-900d-4108-aaa4-071956e14b65": { "startDateISOFormatNotUTC": "2025-11-14T21:30:00-03:00", "startTime": "9:30 p. m.", "startDateFormatted": "14 de noviembre de 2025" },
            "a4dbd822-2b27-4b39-8a68-725dde789c82": { "startDateISOFormatNotUTC": "2025-11-15T20:00:00-03:00", "startTime": "8:00 p. m.", "startDateFormatted": "15 de noviembre de 2025" },
            "71721c86-22a5-4e93-9e71-6ea1b20a71ea": { "startDateISOFormatNotUTC": "2025-11-22T19:00:00-03:00", "startTime": "7:00 p. m.", "startDateFormatted": "22 de noviembre de 2025" },
            "d96232a1-8cfa-4c0e-8f5c-8100406bd2c7": { "startDateISOFormatNotUTC": "2025-11-28T20:30:00-03:00", "startTime": "8:30 p. m.", "startDateFormatted": "28 de noviembre de 2025" },
            "bbcac8d0-99ed-4dc2-9b0c-de2386fc0ad3": { "startDateISOFormatNotUTC": "2025-11-29T20:30:00-03:00", "startTime": "8:30 p. m.", "startDateFormatted": "29 de noviembre de 2025" }
        },
        "common": {},
        "calendar": {}
    },
    "total": 17
};

/* ---------- Definición de Tipos y Lógica de Mapeo ---------- */

// Tipo para el ítem de evento completo (ajustado para tu componente)
interface EventItem {
  id: string;
  title: string;
  excerpt: string;
  place: string;
  dateISO: string;
  timeFormatted: string;
  dateFormatted: string;
  imageURL: string;
  address: string; // Añadido para la búsqueda
  category: "Arte Visual" | "Taller" | "Música" | "Literatura" | "Danza" | null;
}

// Función auxiliar para determinar la categoría (mejorada para cubrir todos los casos)
const getCategory = (title: string, description: string): EventItem["category"] => {
  const lowerText = (title + ' ' + description).toLowerCase();

  if (lowerText.includes("salón") || lowerText.includes("muestra") || lowerText.includes("pintura") || lowerText.includes("grabado") || lowerText.includes("cerámica")) {
    return "Arte Visual";
  }
  if (lowerText.includes("taller") || lowerText.includes("clínica") || lowerText.includes("formación") || lowerText.includes("artmaker") || lowerText.includes("curaduría")) {
    return "Taller";
  }
  if (lowerText.includes("concierto") || lowerText.includes("coral") || lowerText.includes("festival") || lowerText.includes("rojas") || lowerText.includes("cisne") || lowerText.includes("canticuenticos")) {
    return "Música";
  }
  if (lowerText.includes("libro") || lowerText.includes("presentación") || lowerText.includes("escritor")) {
    return "Literatura";
  }
  if (lowerText.includes("milonga") || lowerText.includes("gutmann") || lowerText.includes("stand up")) {
    return "Danza"; // Usamos Danza/Espectáculo en general
  }
  return null;
};

// Mapeo del dataRaw a la estructura EventItem
const INITIAL_EVENTS: EventItem[] = dataRaw.component.events.map((ev: any) => {
    const dates = dataRaw.dates.events[ev.id];
    // Usamos la descripción o un valor por defecto si está vacía
    const excerpt = (ev.description || ev.title).replace(/\n/g, ' ').trim() || 'Evento cultural en Jujuy.';

    return {
        id: ev.id,
        title: ev.title,
        excerpt: excerpt.length > 80 ? excerpt.substring(0, 77) + '...' : excerpt, // Limitar a 80 caracteres
        place: ev.location.name,
        address: ev.location.formattedAddress,
        dateISO: dates.startDateISOFormatNotUTC,
        timeFormatted: dates.startTime,
        dateFormatted: dates.startDateFormatted,
        imageURL: ev.mainImage?.url || "https://example.com/placeholder-default.jpg", // Placeholder genérico si falta
        category: getCategory(ev.title, ev.description),
    };
});

/* ---------- Utilidades de fecha y Componentes (sin cambios) ---------- */
// Las funciones fmtTime, getWeekRange, Badge y EventCard se mantienen de tu código original,
// usando las nuevas propiedades 'imageURL', 'timeFormatted', 'dateFormatted', y 'address'.

const fmtTime = (iso: string) => {
  // Nota: Al usar new Date(iso), se utiliza la hora local del ISO (ej. -03:00)
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeStyle: 'short' }).replace(/\s/g, '\xa0');
}

const getWeekRange = (centerISO: string = new Date().toISOString()) => {
  const center = new Date(centerISO);
  const start = new Date(center);
  // Empieza el Lunes. getDay() 0=Dom, 6=Sáb. (0-1) + 7 % 7 es el offset al lunes
  start.setDate(center.getDate() - (center.getDay() || 7) + 1); 
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/10 border border-white/10">
      <Tag className="w-3 h-3" />
      {text}
    </span>
  );
}

function EventCard({ ev }: { ev: EventItem }) {
  return (
    <article
      className={`w-full md:w-[320px] group bg-gradient-to-b from-green-50/60 to-white/10 border border-white/5 rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden`}
      aria-labelledby={`t-${ev.id}`}
    >
      {/* Imagen */}
      <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
        <img
          src={ev.imageURL}
          alt={`Imagen para ${ev.title}`}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e: any) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/1600x900?text=Cultura+Jujuy"; e.target.className += " object-contain bg-gray-200" }} // Fallback
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 id={`t-${ev.id}`} className="text-sm md:text-base font-bold text-slate-900 line-clamp-2">
            {ev.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.excerpt}</p>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Clock className="w-3 h-3 text-green-600" />
              <span className="font-semibold">{ev.timeFormatted}</span>
              <span className="mx-1 text-slate-400">·</span>
              <span className="font-medium">{ev.dateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-3 h-3 text-green-600" />
              <span className="truncate max-w-[12rem]">{ev.place}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: categoría visible */}
      <div className="mt-3 flex justify-start">
        <Badge text={ev.category ?? "Cultural"} />
      </div>
    </article>
  );
}


/* ---------- Componente Principal AgendaPage (sin cambios en la lógica de renderizado) ---------- */
export default function AgendaPage() {
  const [centerISO] = useState("2025-10-26T00:00:00"); // Fecha actual: 26 de octubre de 2025
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<null | string>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const weekDays = useMemo(() => getWeekRange(centerISO), [centerISO]);

  const events = useMemo(() => {
    return INITIAL_EVENTS.filter((ev) => {
      if (query && !`${ev.title} ${ev.excerpt} ${ev.place} ${ev.address}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (category && ev.category !== category) return false;
      return true;
    });
  }, [query, category]);

  // Agrupar por día
  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    weekDays.forEach((d) => map.set(d.toDateString(), []));
    
    events.forEach((ev) => {
      // Usar dateISO para precisión
      const d = new Date(ev.dateISO);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
      
      if (map.has(key)) {
        map.get(key)!.push(ev);
      } else {
        // Manejar eventos fuera del rango de la semana visible, si es necesario, 
        // pero por ahora solo se muestran los que caen dentro de weekDays.
      }
    });

    // ordenar por hora
    map.forEach((arr) => arr.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()));
    return map;
  }, [events, weekDays]);

  const allCategories = Array.from(new Set(INITIAL_EVENTS.map((e) => e.category).filter(Boolean))) as string[];

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-white to-green-50">
        {/* HERO */}
        <header className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-400 text-white shadow-md mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-semibold">Agenda cultural · Jujuy — Octubre/Noviembre 2025</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Agenda cultural y artística de Jujuy
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
            Descubrí los eventos, talleres, conciertos y exposiciones más importantes de la provincia.
          </p>

          <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-center">
            <div className="w-full md:w-[480px] flex items-center bg-white rounded-full shadow-sm border border-white/20 px-3 py-2">
              <input
                type="search"
                placeholder="Buscar evento, lugar o palabra clave..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm md:text-base"
              />
              <button
                aria-label="Buscar"
                className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Buscar
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={category ?? ""}
                onChange={(e) => setCategory(e.target.value || null)}
                className="rounded-full text-sm md:text-base px-4 py-2 border border-white/20 bg-white shadow-sm"
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="hidden md:flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-white/20">
                <button
                  onClick={() => setView("grid")}
                  className={`px-3 py-1 rounded-full text-sm ${view === "grid" ? "bg-green-600 text-white" : ""}`}
                  aria-pressed={view === "grid"}
                >
                  Cuadros
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1 rounded-full text-sm ${view === "list" ? "bg-green-600 text-white" : ""}`}
                  aria-pressed={view === "list"}
                >
                  Lista
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <section className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Contenido principal de la agenda (abarca 3 columnas en LG) */}
          <aside className="lg:col-span-3">
            {/* Days bar: scroller horizontal en móvil */}
            <div className="mt-3">
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1 justify-start md:justify-center">
                {weekDays.map((d) => {
                  const key = d.toDateString();
                  // Determina si hay eventos para ese día para aplicar estilo
                  const hasEvents = (grouped.get(key) ?? []).length > 0;
                  const isToday = key === new Date(centerISO).toDateString(); // Asumo que centerISO define "hoy" para la barra

                  return (
                    <button
                      key={key}
                      className={`min-w-[110px] md:min-w-[140px] flex-shrink-0 rounded-2xl border px-4 py-3 text-left shadow-sm hover:shadow-md transition 
                        ${isToday ? "bg-green-100 border-green-300" : "bg-white/80 border-white/10"}
                        ${hasEvents ? 'ring-2 ring-green-500' : ''}`}
                      title={d.toDateString()}
                    >
                      <div className="text-xs text-slate-500">{d.toLocaleDateString("es-AR", { weekday: "short" })}</div>
                      <div className="mt-1 font-semibold text-slate-900">{d.getDate()} {d.toLocaleDateString("es-AR", { month: "short" })}</div>
                      {hasEvents && <div className="text-xs text-green-600 font-bold mt-1">({(grouped.get(key) ?? []).length})</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRID / LIST VIEW */}
            <div className="mt-6">
              {events.length === 0 && (
                  <div className="text-center p-8 bg-white/50 rounded-xl text-slate-600">
                    No se encontraron eventos con los filtros aplicados.
                  </div>
              )}
              {view === "grid" ? (
                // Vista de Cuadros (Grid)
                <div>
                  <div className="md:hidden">
                    <div className="flex gap-4 overflow-x-auto py-2 px-2 no-scrollbar">
                      {events.map((ev) => (
                        <div key={ev.id} className="min-w-[260px]">
                          <EventCard ev={ev} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((ev) => (
                      <EventCard key={ev.id} ev={ev} />
                    ))}
                  </div>
                </div>
              ) : (
                // Vista de Lista (Agrupada por día)
                <div className="space-y-3">
                  {Array.from(grouped.entries()).map(([dayKey, arr]) => (
                    // Solo muestra días con eventos o si tiene la vista activada.
                    (arr.length > 0) && (
                      <div key={dayKey} className="bg-white/40 border border-white/10 rounded-2xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-slate-800 border-b pb-2 mb-2 w-full">
                            {new Date(dayKey).toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })}
                          </div>
                          <div className="text-xs text-slate-500 hidden md:block">
                            {arr.length} {arr.length === 1 ? 'evento' : 'eventos'}
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {arr.length ? (
                            arr.map((ev) => (
                              <div key={ev.id} className="p-3 rounded-lg bg-white/80 border border-white/5 flex items-start gap-3 hover:bg-white transition">
                                <div className="w-12 h-12 flex-shrink-0">
                                  <img 
                                    src={ev.imageURL} 
                                    alt={ev.title} 
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e: any) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/1600x900?text=Cultura+Jujuy"; e.target.className += " object-contain bg-gray-200" }} // Fallback
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="font-semibold text-slate-900 text-sm">{ev.title}</div>
                                    <div className="text-xs text-green-600 font-bold flex-shrink-0 ml-4">{ev.timeFormatted}</div>
                                  </div>
                                  <div className="text-xs text-slate-600 mt-1">{ev.place}</div>
                                  <div className="mt-1">
                                    <Badge text={ev.category ?? "Cultural"} />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-500 p-2">No hay eventos programados para este día.</div>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT / BOTTOM: Destacados + Mapa + CTA (en desktop aparece a la derecha) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* CTA donar/colaborar */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl p-4 shadow-lg">
                <h5 className="font-bold">Apoyá la agenda</h5>
                <p className="text-sm mt-2">Si querés que tu actividad aparezca aquí, mandanos la información y la publicamos.</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold border border-white/20">Enviar evento</button>
                  <button className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-green-700">Donar</button>
                </div>
              </div>

              {/* Legend / filtros rápidos */}
              <div className="bg-white/70 rounded-2xl p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-700 font-semibold">Categorias</div>
                  <div className="text-xs text-slate-500">{allCategories.length}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setCategory(null)} className={`text-xs px-3 py-1 rounded-full border transition ${category === null ? 'bg-green-600 text-white border-green-600' : 'bg-white/80'}`}>Todas</button>
                  {allCategories.map((c) => (
                    <button 
                      key={c} 
                      onClick={() => setCategory(c)} 
                      className={`text-xs px-3 py-1 rounded-full border transition ${category === c ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 border-green-200 text-green-800'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </Layout>
  );
}