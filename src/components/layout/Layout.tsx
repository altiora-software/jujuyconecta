import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value,
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)?.value,
    };

    try {
      console.log("Form enviado:", data);
      alert("¡Gracias por comunicarte! Te responderemos pronto.");
      form.reset();
    } catch (error) {
      console.error("Error enviando formulario:", error);
      alert("Hubo un error al enviar el mensaje. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card/50 py-12 mt-16">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-2">
          {/* Columna 1 - Marca */}
          <div className="text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="h-6 w-6 rounded bg-gradient-hero flex items-center justify-center">
                <span className="text-white font-bold text-xs">JC</span>
              </div>
              <span className="text-lg font-semibold text-primary">Jujuy Conecta</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Conectando a los jujeños con recursos, transporte y oportunidades
            </p>
            <p className="text-muted-foreground text-xs">
              © 2024 Jujuy Conecta. Desarrollado por <a href="https://altiorasoftware.com.ar"> Altiora Software </a> ❤️ para la comunidad jujeña.
            </p>
          </div>

          {/* Columna 2 - Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3 text-center md:text-left">
            <h3 className="text-lg font-semibold">📩 Conectate con nosotros</h3>
            <p className="text-sm text-muted-foreground">
              ¿Tenés dudas, sugerencias o querés sumar tu proyecto? Escribinos:
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <Input name="name" placeholder="Tu nombre" required />
              <Input type="email" name="email" placeholder="Tu email" required />
            </div>
            <Textarea
              name="message"
              placeholder="Tu mensaje..."
              rows={3}
              required
            />
            <Button type="submit" disabled={sending} className="w-full md:w-auto">
              {sending ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
