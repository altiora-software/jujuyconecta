import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KEY = "correlator:id";

function createId() {
  // Usa crypto nativo si está disponible; cae a un random simple si no.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `corr_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

/**
 * Devuelve el correlator actual de la sesión (crea uno si no existe).
 * Vive en sessionStorage, por lo que se renueva al cerrar la pestaña.
 */
export function getCorrelator(): string {
  const stored = sessionStorage.getItem(KEY);
  if (stored) return stored;
  const id = createId();
  sessionStorage.setItem(KEY, id);
  return id;
}

/**
 * Fuerza la rotación del correlator (útil cuando "creás una nueva sesión" de chat).
 */
export function rotateCorrelator(): string {
  const id = createId();
  sessionStorage.setItem(KEY, id);
  return id;
}
