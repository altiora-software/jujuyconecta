// src/components/jobs/JobDetailDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobListing } from "@/components/types/jobs";

import {
  Briefcase,
  MapPin,
  Clock,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  ListChecks,
} from "lucide-react";

interface JobDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobListing | null;
}

function formatJobType(type: JobListing["job_type"]) {
  if (type === "full_time") return "Tiempo completo";
  if (type === "part_time") return "Medio tiempo";
  if (type === "freelance") return "Freelance";
  if (type === "internship") return "Pasantía";
  if (type === "temporary") return "Temporal";
  return "Otro";
}

function formatModality(modality: JobListing["modality"]) {
  if (modality === "onsite") return "Presencial";
  if (modality === "remote") return "Remoto";
  if (modality === "hybrid") return "Híbrido";
  return "Modalidad a definir";
}

function formatSalary(job: JobListing) {
  if (!job.salary_visible || (!job.salary_from && !job.salary_to)) return null;

  const currency = job.salary_currency || "ARS";
  if (job.salary_from && job.salary_to) {
    return `${currency} ${job.salary_from.toLocaleString("es-AR")} - ${job.salary_to.toLocaleString("es-AR")} / mes`;
  }
  if (job.salary_from) {
    return `Desde ${currency} ${job.salary_from.toLocaleString("es-AR")} / mes`;
  }
  if (job.salary_to) {
    return `Hasta ${currency} ${job.salary_to.toLocaleString("es-AR")} / mes`;
  }
  return null;
}

function buildWhatsAppLink(job: JobListing) {
  const phone = job.whatsapp || job.contact_phone;
  if (!phone) return null;
  const clean = phone.replace(/[^\d]/g, "");
  const texto = encodeURIComponent(
    `Hola, vi tu aviso de trabajo "${job.title}" en Jujuy Conecta y me gustaría postularme.`
  );
  return `https://wa.me/${clean}?text=${texto}`;
}

export function JobDetailDialog({ open, onOpenChange, job }: JobDetailDialogProps) {
  if (!job) return null;

  const salaryText = formatSalary(job);
  const whatsappLink = buildWhatsAppLink(job);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {job.title}
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <p className="font-medium text-foreground">{job.company_name}</p>
            <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm">
              <Badge variant="outline">{formatJobType(job.job_type)}</Badge>
              <Badge variant="secondary">{formatModality(job.modality)}</Badge>
              {job.category && <Badge variant="outline">{job.category}</Badge>}
              {job.municipality && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {job.municipality}
                </span>
              )}
              {job.schedule && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {job.schedule}
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {salaryText && (
            <div className="flex items-start gap-2">
              <ListChecks className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Rango salarial</p>
                <p className="text-muted-foreground">{salaryText}</p>
              </div>
            </div>
          )}

          {job.description && (
            <div>
              <p className="font-medium mb-1">Descripción del puesto</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}

          {job.requirements && (
            <div>
              <p className="font-medium mb-1">Requisitos</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.requirements}
              </p>
            </div>
          )}

          {job.responsibilities && (
            <div>
              <p className="font-medium mb-1">Responsabilidades</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {job.benefits && (
            <div>
              <p className="font-medium mb-1">Beneficios</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.benefits}
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {(job.address || job.city || job.region) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-muted-foreground">
                    {job.address && <>{job.address}<br /></>}
                    {job.municipality && `${job.municipality}, `}
                    {"Jujuy"}
                  </p>
                </div>
              </div>
            )}

            {(job.contact_email || job.contact_phone || job.whatsapp) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Contacto</p>
                    {job.contact_email && (
                      <p className="text-muted-foreground">{job.contact_email}</p>
                    )}
                    {job.contact_phone && (
                      <p className="text-muted-foreground">
                        Tel: {job.contact_phone}
                      </p>
                    )}
                    {job.whatsapp && (
                      <p className="text-muted-foreground">
                        WhatsApp: {job.whatsapp}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {job.application_instructions && (
            <div>
              <p className="font-medium mb-1">Cómo postularte</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.application_instructions}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {whatsappLink && (
              <Button
                type="button"
                onClick={() => {
                  window.open(whatsappLink, "_blank");
                }}
                className="flex-1 sm:flex-none"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Consultar por WhatsApp
              </Button>
            )}

            {job.application_link && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const url = job.application_link!.startsWith("http")
                    ? job.application_link!
                    : `https://${job.application_link}`;
                  window.open(url, "_blank");
                }}
                className="flex-1 sm:flex-none"
              >
                <Globe className="h-4 w-4 mr-2" />
                Postularme en el sitio
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
