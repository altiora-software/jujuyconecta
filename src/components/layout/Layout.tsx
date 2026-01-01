import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ScrollToTop } from "./ScrollToTop";
import { Footer } from "./Footer";

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
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">{children}</main>
      
      <Footer />
    </div>
  );
}