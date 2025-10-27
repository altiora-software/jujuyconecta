// src/components/common/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop({ behavior = "smooth" }: { behavior?: ScrollBehavior }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // si hay hash (ancla), podemos respetarlo y hacer scroll a ese elemento
    if (hash) {
      // damos un pequeño timeout para que el elemento esté en el DOM
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior });
        return;
      }
    }

    // si no hay hash, scroll al tope
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, hash, behavior]);

  return null;
}
