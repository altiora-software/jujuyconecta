// src/hooks/useCorrelator.ts
import { useMemo } from "react";
import { getCorrelator, rotateCorrelator } from "@/lib/utils";

export function useCorrelator() {
  // Se memoiza en el primer render de la pestaña
  const correlator = useMemo(() => getCorrelator(), []);
  return { correlator, rotateCorrelator };
}
