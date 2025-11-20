// src/components/AiTrainingModal.tsx
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onRequestAccess?: (email: string) => Promise<void> | void;
  supportEmail?: string;
};

const STORAGE_KEY = "jc_ai_notify_v1";

export default function AiTrainingModal({ open, onClose, onRequestAccess, supportEmail }: Props) {
  const { toast } = (typeof useToast === "function" ? useToast() : { toast: undefined }) as any;
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const prev = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (prev) {
        try {
          const parsed = JSON.parse(prev);
          if (parsed?.email) setEmail(parsed.email);
          if (parsed?.requested) setDone(true);
        } catch {
          // noop
        }
      } else {
        setEmail("");
        setDone(false);
      }

      setError(null);
      setLoading(false);
      setAgree(false);
    }
  }, [open]);

  const validateEmail = (e: string) => /^\S+@\S+\.\S+$/.test(e);

  // function that performs the supabase insert and returns { success, data?, error? }
  const requestAiAccess = useCallback(
    async (payload: { email: string; agreed: boolean }) => {
      try {
        // Insert and return inserted row id (helps to confirm success)
        const { data, error } = await supabase
          .from("ai_access_requests")
          .insert([
            {
              email: payload.email.toLowerCase(),
              agreed: payload.agreed,
              source: "modal-ai",
              notes: null,
            },
          ])

        if (error) {
          console.error("Supabase insert error:", error);
          return { success: false, error };
        }

        return { success: true, data };
      } catch (err: any) {
        console.error("requestAiAccess unexpected error:", err);
        return { success: false, error: err };
      }
    },
    []
  );

  const handleRequest = useCallback(async () => {
    setError(null);

    if (!validateEmail(email)) {
      setError("Ingresá un email válido para que podamos avisarte.");
      return;
    }
    if (!agree) {
      setError("Aceptá que querés recibir noticias y acceso anticipado.");
      return;
    }

    setLoading(true);

    try {
      // Si viene una función externa la usamos (por ejemplo para usar un endpoint server-side).
      if (onRequestAccess) {
        await onRequestAccess(email);
        // si no arroja error, consideramos success
        setDone(true);
        // guarda local solo después de success
        // localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, requested: true, requestedAt: new Date().toISOString() }));
        if (toast) toast({ title: "¡Listo!", description: "Te avisaremos cuando el asistente esté disponible." });
        return;
      }

      // fallback: insert directo en Supabase (cliente). Asegurate de tener RLS/policies configuradas.
      const res = await requestAiAccess({ email, agreed: true });

      if (!res.success) {
        // muestra mensaje útil al usuario y log para debugging
        const msg = (res.error && (res.error.message || JSON.stringify(res.error))) || "Error al guardar la solicitud";
        setError(String(msg));
        if (toast) toast({ title: "No se pudo enviar", description: String(msg), variant: "destructive" });
        return;
      }

      // éxito: guardo local y muestro agradecimiento
    //   localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, requested: true, requestedAt: new Date().toISOString() }));
      setDone(true);
      if (toast) toast({ title: "¡Solicitud enviada!", description: "Te avisaremos cuando el asistente esté disponible." });
    } catch (err: any) {
      console.error("handleRequest error:", err);
      setError("Ocurrió un error. Intentá nuevamente en unos minutos.");
      if (toast) toast({ title: "Error", description: err.message || "Error al enviar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [email, agree, onRequestAccess, requestAiAccess, toast]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-green-600 to-green-400 text-white">
              <Zap className="w-5 h-5" />
            </span>
            Asistente IA — En entrenamiento
          </DialogTitle>

          <DialogDescription>
            Estamos entrenando nuestro asistente inteligente. Por ahora la función de chat/IA está en fase experimental.
            Dejá tu email y te avisamos cuando esté disponible.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-[pulse_1.2s_infinite]" />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-[pulse_1.6s_infinite]" />
            </div>
            <div className="text-sm text-slate-600">
              Estamos mejorando la IA: datos locales, respuestas seguras y contexto cultural jujeño.
            </div>
          </div>

          <div className="text-sm text-slate-700">
            Queremos que el asistente entienda la idiosincrasia local. Mientras tanto, podés pedir acceso anticipado.
          </div>

          {!done ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Tu email
              </label>

              <div className="flex gap-2">
                <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="tunombre@ejemplo.com" className="flex-1" />
                {/* <Button onClick={handleRequest} disabled={loading} className="whitespace-nowrap">
                  {loading ? "Enviando..." : "Solicitar acceso"}
                </Button> */}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <input id="ai-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="rounded" />
                <label htmlFor="ai-agree" className="select-none">
                  Quiero recibir notificaciones y participar del acceso anticipado.
                </label>
              </div>

              {error ? <div className="text-xs text-red-600">{error}</div> : null}

              <div className="text-xs text-slate-500">
                Usamos tu email solo para notificarte. Si preferís, escribinos a{" "}
                <a href={`mailto:${supportEmail ?? "jujuyconecta@gmail.com"}`} className="underline">
                  {supportEmail ?? "jujuyconecta@gmail.com"}
                </a>
                .
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="text-sm font-semibold text-green-800">¡Gracias! Te avisaremos</div>
              <div className="text-xs text-slate-600">Recibirás un email cuando el asistente esté listo. También podés seguirnos en YouTube para actualizaciones.</div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
            {!done && (
              <Button onClick={handleRequest} disabled={loading || !agree}>
                {loading ? "Procesando..." : "Solicitar acceso anticipado"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
