import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">¡Página no encontrada!</p>
          <p className="mb-6 text-muted-foreground">
            La página que buscás no existe o fue movida.
          </p>
          <a href="/" className="text-primary underline hover:text-primary/80 transition-smooth">
            Volver al inicio
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
