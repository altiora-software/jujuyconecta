import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onContinueWithGoogle: () => Promise<void> | void;
  supportEmail?: string; // opcional por si lo querés mostrar
};

const TERMS_KEY = "jc_terms_accepted_v1";

export default function LoginRequiredDialog({
  open,
  onClose,
  onContinueWithGoogle,
  supportEmail,
}: Props) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar preferencia previa si existiera
  useEffect(() => {
    if (open) {
      const prev = localStorage.getItem(TERMS_KEY);
      setChecked(prev === "true");
    }
  }, [open]);

  const handleToggle = useCallback((value: boolean) => {
    setChecked(value);
    localStorage.setItem(TERMS_KEY, String(value));
  }, []);

  const handleContinue = useCallback(async () => {
    if (!checked) return;
    try {
      setLoading(true);
      await onContinueWithGoogle();
      onClose();
    } finally {
      setLoading(false);
    }
  }, [checked, onContinueWithGoogle, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ingresá para usar el asistente</DialogTitle>
          <DialogDescription>
            Para chatear con el asistente necesitás iniciar sesión con Google.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={checked} onCheckedChange={(v) => handleToggle(Boolean(v))} />
            <Label htmlFor="terms" className="text-sm leading-6">
              Acepto los{" "}
              <Link to="/terminos" className="underline" onClick={onClose}>
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link to="/privacidad" className="underline" onClick={onClose}>
                Política de Privacidad
              </Link>
              .
            </Label>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={!checked || loading}
          >
            {loading ? "Conectando..." : "Continuar con Google"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Usamos tu email solo para autenticarte y crear tu perfil. No accedemos a tus correos,
            contactos ni archivos.
            {supportEmail ? (
              <>
                {" "}¿Dudas? Escribinos a <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
              </>
            ) : null}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
