import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import SocialLinks, { Icons } from "../common/SocialLinks";

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

    if (honey) { setSending(false); return; }

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
      <SocialLinks
        items={[
          { href: "https://instagram.com/jujuy_conecta", label: "Instagram", icon: Icons.Instagram },
          { href: "https://facebook.com/jujuy_conecta", label: "Facebook", icon: Icons.Facebook },
          { href: "https://x.com/jujuy_conecta", label: "Twitter/X", icon: Icons.Twitter },
          { href: "https://youtube.com/@jujuyconecta", label: "YouTube", icon: Icons.Youtube },
          { href: "mailto:jujuyconecta@gmail.com.ar", label: "Email", icon: Icons.Mail },
        ]}
        className="justify-center md:justify-start"
        rounded="2xl"
      />
      <footer className="border-t bg-card/50 py-12 mt-16">
        {/* Primera fila: 1→2→4 columnas responsivas */}
        <div className="container mx-auto px-4 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Transparencia de datos */}
          <div className="text-center sm:text-left space-y-3">
            <h3 className="text-base font-semibold">🔎 Transparencia de datos</h3>
            <p className="text-sm text-muted-foreground">
              La información publicada se compila de <strong>fuentes públicas</strong>
              {" "} (organismos oficiales, sitios web institucionales, mapas y aportes de la comunidad) y puede actualizarse periódicamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Para usar la app solo solicitamos tu <strong>email de Google</strong> con fines de autenticación.
              No accedemos a tus correos, contactos ni archivos.
            </p>
            <p className="text-sm">
              Conocé más en nuestra{" "}
              <Link to="/privacidad" className="underline">Política de Privacidad</Link>.
            </p>
          </div>

          {/* Legal */}
          <nav className="text-center sm:text-left space-y-3">
            <h3 className="text-base font-semibold">📑 Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terminos" className="hover:underline">Términos y Condiciones</Link>
              </li>
              <li>
                <Link to="/privacidad" className="hover:underline">Política de Privacidad</Link>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Uso responsable: la app es informativa y no reemplaza asesoramiento oficial o profesional.
            </p>
          </nav>

          {/* Formulario de contacto */}
          <form onSubmit={handleSubmit} className="space-y-3 text-center sm:text-left">
            <h3 className="text-base font-semibold">📩 ¡Contactanos!</h3>
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

        {/* Segunda fila: barra inferior fina */}
        <div className="container mx-auto px-4">
          <div className="mt-10 pt-6 border-t text-xs text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
            <p>
              Operamos bajo principios de <strong>transparencia</strong> y{" "}
              <strong>protección de datos</strong>. Si detectás información desactualizada o querés reportar un cambio,
              escribinos desde el formulario.
            </p>
            <div className="flex gap-4 justify-start md:justify-end">
              <Link to="/terminos" className="hover:underline">Términos</Link>
              <span className="opacity-40">•</span>
              <Link to="/privacidad" className="hover:underline">Privacidad</Link>
            </div>
          </div>
        </div>
         {/* Marca */}
         <div className="text-center sm:text-left space-y-3">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="h-6 w-6 rounded bg-gradient-hero flex items-center justify-center">
                <span className="text-white font-bold text-xs">JC</span>
              </div>
              <span className="text-lg font-semibold text-primary">Jujuy Conecta</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Conectando a los jujeños con recursos, transporte y oportunidades.
            </p>
            <p className="text-muted-foreground text-xs">
              © 2025 Jujuy Conecta. Desarrollado por{" "}
              <a href="https://altiorasoftware.com.ar" target="_blank" rel="noreferrer" className="underline">
                Altiora Software
              </a>{" "}
              ❤️ para la comunidad jujeña.
            </p>
          </div>
      </footer>
    </div>
  );
}
