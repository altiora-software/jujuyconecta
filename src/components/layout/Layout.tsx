import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-card/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded bg-gradient-hero flex items-center justify-center">
                <span className="text-white font-bold text-xs">JC</span>
              </div>
              <span className="text-lg font-semibold text-primary">Jujuy Conecta</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Conectando a los jujeños con recursos, transporte y oportunidades
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              © 2024 Jujuy Conecta. Desarrollado con ❤️ para la comunidad jujeña.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}