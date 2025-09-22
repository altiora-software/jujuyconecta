import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps { children: ReactNode; }

export function Layout({ children }: LayoutProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value.trim();
    const honey = (form.elements.namedItem("company") as HTMLInputElement)?.value; // honeypot

    // anti-bot básico
    if (honey) { setSending(false); return; }

    // validación mínima
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) {
      toast({ title: "Email inválido", description: "Revisá el formato.", variant: "destructive" });
      setSending(false);
      return;
    }

    try {
      const { error } = await supabase.from("contact_messages").insert([
        { name, email, message, source: window.location.href }
      ]);
      if (error) throw error;

      toast({ title: "¡Mensaje enviado!", description: "Te respondemos a la brevedad." });
      form.reset();
    } catch (err: any) {
      console.error(err);
      toast({ title: "No pudimos enviar tu mensaje", description: err.message || "Probá de nuevo.", variant: "destructive" });
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
          {/* Marca */}
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
              © 2024 Jujuy Conecta. Desarrollado por{" "}
              <a href="https://altiorasoftware.com.ar" target="_blank" rel="noreferrer">Altiora Software</a> ❤️ para la comunidad jujeña.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3 text-center md:text-left">
            <h3 className="text-lg font-semibold">📩 ¡Contactanos!</h3>
            <p className="text-sm text-muted-foreground">
              ¿Dudas, sugerencias o querés sumar tu proyecto? Escribinos:
            </p>

            {/* Honeypot oculto (anti-spam simple) */}
            <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="flex flex-col md:flex-row gap-3">
              <Input name="name" placeholder="Tu nombre" required />
              <Input type="email" name="email" placeholder="Tu email" required />
            </div>
            <Textarea name="message" placeholder="Tu mensaje..." rows={3} required />

            <Button type="submit" disabled={sending} className="w-full md:w-auto">
              {sending ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
