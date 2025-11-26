// src/components/pwa/InstallAppMenuItem.tsx
"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download } from "lucide-react";

export function InstallAppMenuItem() {
  const { isInstallable, installed, install } = usePWAInstall();

  if (!isInstallable || installed) return null;

  return (
    <button
      type="button"
      onClick={install}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <Download className="h-4 w-4" />
      <span>Instalar app</span>
    </button>
  );
}
