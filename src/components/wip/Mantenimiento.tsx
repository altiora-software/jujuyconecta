import { Layout } from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

export default function Mantenimiento(): JSX.Element {
  return (
    <Layout>
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
        {/* Animación / ícono */}
        <Loader2 className="animate-spin h-20 w-20 mb-6 text-white" />

        <h1 className="text-4xl font-bold mb-4">🚧 Sección en desarrollo</h1>
        <p className="text-lg max-w-xl mb-6">
          Estamos trabajando para traerte la mejor experiencia.  
          Mientras tanto, explorá otras secciones, nuestro <strong>diario digital</strong> y <strong>podcast</strong> para no perderte nada.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/"
            className="bg-white text-blue-900 font-semibold px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            Volver al inicio
          </a>
          <a
            href="/diario-digital"
            className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-blue-900 transition-colors"
          >
            Ver nuestro diario digital
          </a>
        </div>

        {/* Toque divertido / branding */}
        <p className="mt-12 text-sm text-blue-200">
          ⚡ Jujuy Conecta – Conectando ideas y personas, siempre en movimiento
        </p>
      </main>
    </Layout>
  );
}
