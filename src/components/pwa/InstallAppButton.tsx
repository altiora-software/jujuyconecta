// src/components/pwa/InstallAppButton.tsx
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function InstallAppButton() {
  const { isInstallable, installed, install } = usePWAInstall();

  // Si no es instalable o ya está instalada, no muestres nada
  if (!isInstallable || installed) return null;

  return (
    <button
      onClick={install}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                 w-[75%] max-w-md rounded-full bg-green-600 px-4 py-3
                 text-sm font-semibold text-white shadow-lg
                 flex items-center justify-center gap-2"
    >
      <span>Instalar Jujuy Conecta</span>
    </button>
  );
}
