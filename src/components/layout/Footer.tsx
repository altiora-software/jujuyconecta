import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

export function Footer() {
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
    <footer className="border-t bg-slate-950 text-slate-300 py-12 mt-16">
      <div className="container mx-auto px-4 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Transparencia de datos */}
        <div className="text-center sm:text-left space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-tight">🔎 Transparencia de datos</h3>
          <p className="text-sm text-slate-400">
            La información publicada se compila de <strong>fuentes públicas</strong>
            {" "} (organismos oficiales, sitios web institucionales, mapas y aportes de la comunidad) y puede actualizarse periódicamente.
          </p>
          <p className="text-sm text-slate-400">
            Para usar la app solo solicitamos tu <strong>email de Google</strong> con fines de autenticación.
          </p>
          <p className="text-sm">
            Conocé más en nuestra{" "}
            <Link to="/privacidad" className="underline text-primary">Política de Privacidad</Link>.
          </p>
        </div>

        {/* Legal */}
        <nav className="text-center sm:text-left space-y-3">
          <h3 className="text-base font-bold text-white uppercase tracking-tight">📑 Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
          </ul>
        </nav>

        {/* Formulario de contacto */}
        <form onSubmit={handleSubmit} className="space-y-3 text-center sm:text-left lg:col-span-2">
          <h3 className="text-base font-bold text-white uppercase tracking-tight">📩 ¡Contactanos!</h3>
          <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="flex flex-col md:flex-row gap-3">
            <Input name="name" placeholder="Nombre" required className="bg-slate-900 border-slate-800 text-white" />
            <Input type="email" name="email" placeholder="Email" required className="bg-slate-900 border-slate-800 text-white" />
          </div>
          <Textarea name="message" placeholder="Mensaje..." rows={3} required className="bg-slate-900 border-slate-800 text-white" />
          <Button type="submit" disabled={sending} className="w-full md:w-auto font-bold">
            {sending ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </div>

      {/* Marca / Brand block con el logo real */}
      <div className="w-full flex justify-center mt-12 pt-8 border-t border-slate-900">
        <div className="w-full max-w-2xl px-4 text-center space-y-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {/* Logo Real */}
            <img 
              src="/images/jc.png" 
              alt="Jujuy Conecta Logo" 
              className="h-12 w-auto object-contain"
            />
            <div className="text-left">
              <div className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">
                Jujuy <span className="text-primary font-bold">Conecta</span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                Conectando a los jujeños
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-600 font-bold">
            © 2026 Jujuy Conecta. Desarrollado por{" "}
            <a href="https://ethercode.com.ar" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Ether Code
            </a>{" "}
            ❤️ para la comunidad jujeña.
          </p>
        </div>
      </div>
    </footer>
  );
}