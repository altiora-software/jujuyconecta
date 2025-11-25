// src/components/jobs/JobCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobListing } from "@/components/types/jobs";

import { Briefcase, MapPin, Clock, Star, Globe, MessageCircle } from "lucide-react";

interface JobCardProps {
  job: JobListing;
  onOpenDetails: (job: JobListing) => void;
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

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function buildWhatsAppLink(job: JobListing) {
  const phone = job.whatsapp || job.contact_phone;
  if (!phone) return null;
  const clean = phone.replace(/[^\d]/g, "");
  const texto = encodeURIComponent(
    `Hola, vi tu aviso de trabajo "${job.title}" en Jujuy Conecta y me interesa postularme.`
  );
  return `https://wa.me/${clean}?text=${texto}`;
}

export function JobCard({ job, onOpenDetails }: JobCardProps) {
  const publishedShort = formatDate(job.published_at);
  const whatsappLink = buildWhatsAppLink(job);

  return (
    <Card className={`group flex flex-col rounded-xl border bg-card/90 backdrop-blur-sm hover:shadow-soft hover:-translate-y-[3px] transition-smooth ${
      job.is_featured ? "border-primary/70" : "border-border/70"
    }`}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base md:text-lg line-clamp-1">
              {job.title}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm line-clamp-2">
              {job.company_name}
            </CardDescription>
          </div>

          {job.is_featured && (
            <Badge className="flex items-center gap-1 text-[10px] md:text-xs bg-gradient-hero text-white shadow">
              <Star className="h-3 w-3" />
              Destacado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-[13px] text-muted-foreground">
          <Badge variant="outline" className="flex items-center gap-1 text-[11px] border-dashed">
            <Briefcase className="h-3 w-3" />
            {formatJobType(job.job_type)}
          </Badge>

          <Badge variant="secondary" className="text-[11px]">
            {formatModality(job.modality)}
          </Badge>

          {job.category && (
            <Badge variant="outline" className="text-[11px]">
              {job.category}
            </Badge>
          )}

          {job.municipality && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.municipality}
            </span>
          )}

          {publishedShort && (
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3" />
              {publishedShort}
            </span>
          )}
        </div>

        {job.description && (
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 mt-1">
            {job.description}
          </p>
        )}

        <div className="mt-2 pt-2 border-t flex items-center gap-2">
          {whatsappLink && (
            <Button
              type="button"
              size="sm"
              className="flex-1 text-xs md:text-sm"
              onClick={() => {
                window.open(whatsappLink, "_blank");
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Consultar por WhatsApp
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            onClick={() => onOpenDetails(job)}
            title="Ver detalles del empleo"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
