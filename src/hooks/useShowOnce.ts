import { useEffect, useState } from "react";

/**
 * Muestra algo solo 1 vez por navegador (localStorage).
 * - Se marca como mostrado APENAS se monta (evita que aparezca otra vez si recarga).
 * - `key` te sirve para versionar (cambiás la key y vuelve a mostrarse una vez más).
 */
export function useShowOnce(key = "jc_onboarding_shown_v1") {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(key);
    if (!seen) {
      setShow(true);
      localStorage.setItem(key, String(Date.now())); // queda marcado como visto
    }
  }, [key]);

  const dismiss = () => setShow(false);

  return { show, dismiss };
}
