"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobListing } from "@/components/types/jobs";

import {
  Briefcase,
  MapPin,
  Clock,
  Star,
  Globe,
  MessageCircle,
  Share2,
  Phone,
  Mail,
} from "lucide-react";

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

function isNew(dateStr?: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days <= 5; // 5 días como "nuevo"
}

function formatShortSalary(job: JobListing) {
  if (!job.salary_visible || (!job.salary_from && !job.salary_to)) return null;
  const currency = job.salary_currency || "ARS";

  if (job.salary_from && job.salary_to) {
    return `${currency} ${job.salary_from.toLocaleString("es-AR", {
      maximumFractionDigits: 0,
    })} - ${job.salary_to.toLocaleString("es-AR", {
      maximumFractionDigits: 0,
    })}`;
  }
  if (job.salary_from) {
    return `Desde ${currency} ${job.salary_from.toLocaleString("es-AR", {
      maximumFractionDigits: 0,
    })}`;
  }
  if (job.salary_to) {
    return `Hasta ${currency} ${job.salary_to.toLocaleString("es-AR", {
      maximumFractionDigits: 0,
    })}`;
  }
  return null;
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

function buildShareUrl(job: JobListing) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/empleos#job-${job.id}`;
}

type ContactType = "whatsapp" | "phone" | "email" | "site" | "details";

function getPrimaryContactType(job: JobListing): ContactType {
  if (job.whatsapp || job.contact_phone) return "whatsapp"; // priorizamos contacto directo/chat
  if (job.contact_phone) return "phone";
  if (job.contact_email) return "email";
  if (job.application_link) return "site";
  return "details";
}

export function JobCard({ job, onOpenDetails }: JobCardProps) {
  const publishedShort = formatDate(job.published_at);
  const salaryShort = formatShortSalary(job);

  const primaryContact = getPrimaryContactType(job);
  const whatsappLink = buildWhatsAppLink(job);

  const handlePrimaryContact = () => {
    if (primaryContact === "whatsapp" && whatsappLink) {
      window.open(whatsappLink, "_blank");
      return;
    }

    if (primaryContact === "phone" && job.contact_phone) {
      const clean = job.contact_phone.replace(/[^\d+]/g, "");
      window.open(`tel:${clean}`, "_self");
      return;
    }

    if (primaryContact === "email" && job.contact_email) {
      const subject = encodeURIComponent(
        `Postulación - ${job.title} (Jujuy Conecta)`
      );
      const body = encodeURIComponent(
        `Hola, vi su aviso de trabajo "${job.title}" en Jujuy Conecta y me gustaría postularme.`
      );
      window.open(
        `mailto:${job.contact_email}?subject=${subject}&body=${body}`,
        "_self"
      );
      return;
    }

    if (primaryContact === "site" && job.application_link) {
      const url = job.application_link.startsWith("http")
        ? job.application_link
        : `https://${job.application_link}`;
      window.open(url, "_blank");
      return;
    }

    // Sin datos claros: mandamos al detalle donde está todo
    onOpenDetails(job);
  };

  const primaryLabel = (() => {
    switch (primaryContact) {
      case "whatsapp":
        return "Contactar por WhatsApp";
      case "phone":
        return "Llamar ahora";
      case "email":
        return "Enviar correo";
      case "site":
        return "Postularme en el sitio";
      case "details":
      default:
        return "Ver cómo postularme";
    }
  })();

  const primaryIcon = (() => {
    switch (primaryContact) {
      case "whatsapp":
        return <MessageCircle className="h-4 w-4 mr-1" />;
      case "phone":
        return <Phone className="h-4 w-4 mr-1" />;
      case "email":
        return <Mail className="h-4 w-4 mr-1" />;
      case "site":
        return <Globe className="h-4 w-4 mr-1" />;
      case "details":
      default:
        return <Briefcase className="h-4 w-4 mr-1" />;
    }
  })();

  const handleShare = async () => {
    const url = buildShareUrl(job);
    const text = `Oferta laboral: ${job.title} en ${
      job.company_name || "empresa de Jujuy"
    }`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text,
          url,
        });
      } catch {
        // usuario canceló
      }
    } else if (navigator.clipboard && url) {
      try {
        await navigator.clipboard.writeText(url);
        // acá podés disparar un toast si querés feedback
      } catch {
        // fallo clipboard
      }
    } else if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Card
      id={`job-${job.id}`}
      className={`group flex flex-col rounded-xl border bg-card/90 backdrop-blur-sm hover:shadow-soft hover:-translate-y-[3px] transition-smooth ${
        job.is_featured ? "border-primary/70" : "border-border/70"
      }`}
    >
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base md:text-lg line-clamp-1">
              {job.title}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm line-clamp-2">
              {job.company_name || "Empresa de Jujuy"}
            </CardDescription>
          </div>

          <div className="flex flex-col items-end gap-1">
            {job.is_featured && (
              <Badge className="flex items-center gap-1 text-[10px] md:text-xs bg-gradient-hero text-white shadow">
                <Star className="h-3 w-3" />
                Destacado
              </Badge>
            )}
            {isNew(job.published_at) && (
              <Badge
                variant="outline"
                className="text-[9px] md:text-[10px] border-emerald-500/60 text-emerald-600"
              >
                Nuevo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 flex-1 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-[13px] text-muted-foreground">
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-[11px] border-dashed"
          >
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

        {salaryShort && (
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-[11px] border-amber-500/40 bg-amber-50/60 text-amber-700"
            >
              {salaryShort}
            </Badge>
          </div>
        )}

        {job.description && (
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 mt-1">
            {job.description}
          </p>
        )}

        <div className="mt-2 pt-2 border-t flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="flex-1 text-xs md:text-sm"
            onClick={handlePrimaryContact}
          >
            {primaryIcon}
            {primaryLabel}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            onClick={handleShare}
            title="Compartir oferta"
          >
            <Share2 className="h-4 w-4" />
          </Button>

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
