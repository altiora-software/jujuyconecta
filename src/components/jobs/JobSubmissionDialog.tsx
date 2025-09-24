import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  triggerLabel?: string;
  onSubmitted?: () => void;
};

const CATEGORIES = [
  { value: "comercio", label: "Comercio" },
  { value: "construccion", label: "Construcción" },
  { value: "domestico", label: "Doméstico" },
  { value: "administrativo", label: "Administrativo" },
  { value: "gastronomia", label: "Gastronomía" },
  { value: "educacion", label: "Educación" },
  { value: "salud", label: "Salud" },
  { value: "transporte", label: "Transporte" },
  { value: "otros", label: "Otros" },
];

export default function JobSubmissionDialog({ triggerLabel = "Publicar oferta gratis!", onSubmitted }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "" as "" | "formal" | "informal",
    category: "",
    description: "",
    location: "",
    contact_info: "",
    salary_range: "",
    requirements: "",
    expires_at: "",
  });

  const checks = {
    title: form.title.trim().length >= 4,
    type: form.type === "formal" || form.type === "informal",
    category: !!form.category,
    description: form.description.trim().length >= 10,
    location: form.location.trim().length >= 3,
    contact_info: form.contact_info.trim().length >= 5,
  };

  const canSubmit = useMemo(
    () => Object.values(checks).every(Boolean),
    [checks.title, checks.type, checks.category, checks.description, checks.location, checks.contact_info]
  );

  async function handleSubmit() {
    try {
      if (!canSubmit) {
        toast({
          title: "Datos incompletos",
          description: "Completá título, tipo, categoría, descripción, ubicación y contacto.",
          variant: "destructive",
        });
        return;
      }
      setPosting(true);

      const payload = {
        title: form.title.trim(),
        type: form.type as "formal" | "informal",
        category: form.category,
        description: form.description.trim(),
        location: form.location.trim(),
        contact_info: form.contact_info.trim(),
        salary_range: form.salary_range?.trim() || null,
        requirements: form.requirements?.trim() || null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        submitted_by: user?.id ?? null,
        submitted_email: user?.email ?? null,
        status: "pending" as const,
      };

      const { error } = await supabase.from("job_submissions").insert([payload]);
      if (error) throw error;

      toast({
        title: "Enviado para revisión",
        description: "Vamos a verificar la oferta y publicarla si todo está OK.",
      });

      setOpen(false);
      setForm({
        title: "",
        type: "" as any,
        category: "",
        description: "",
        location: "",
        contact_info: "",
        salary_range: "",
        requirements: "",
        expires_at: "",
      });

      onSubmitted?.();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "No se pudo enviar tu oferta",
        description: e?.message || "Reintentá en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          {triggerLabel}
          <Briefcase className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar oferta para revisión</DialogTitle>
          <DialogDescription>
            Verificamos la información antes de publicarla para evitar fraudes o datos falsos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ej: Electricista matriculado / Cajero de supermercado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                // ⬇️ usar undefined cuando está vacío; evita problemas de shadcn Select
                value={form.type || undefined}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v as "formal" | "informal" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                value={form.category || undefined}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ubicación *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="San Salvador de Jujuy / Palpalá / Perico..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              placeholder="Tareas, jornada, modalidad, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contacto *</Label>
              <Input
                value={form.contact_info}
                onChange={(e) => setForm((p) => ({ ...p, contact_info: e.target.value }))}
                placeholder="Teléfono, WhatsApp o e-mail"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Rango salarial (opcional)</Label>
              <Input
                value={form.salary_range}
                onChange={(e) => setForm((p) => ({ ...p, salary_range: e.target.value }))}
                placeholder="Ej: $500k - $650k"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Requisitos (opcional)</Label>
              <Input
                value={form.requirements}
                onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                placeholder="Experiencia, cursos, carnet, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de expiración (opcional)</Label>
              <Input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
              />
            </div>
          </div>

          {/* Helper opcional: mostrar qué falta (para debug) */}
          {!canSubmit && (
            <p className="text-xs text-muted-foreground">
              Faltan:{" "}
              {!checks.title && "título (≥4) "}
              {!checks.type && "tipo "}
              {!checks.category && "categoría "}
              {!checks.description && "descripción (≥10) "}
              {!checks.location && "ubicación (≥3) "}
              {!checks.contact_info && "contacto (≥5) "}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={posting || !canSubmit}>
              {posting ? "Enviando..." : "Enviar para revisión"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
