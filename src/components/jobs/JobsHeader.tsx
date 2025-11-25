// src/components/jobs/JobsHeader.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Sparkles, MapPin } from "lucide-react";

interface JobsHeaderProps {
  totalJobs: number;
  totalMunicipalities: number;
  totalCategories: number;
}

export function JobsHeader({ totalJobs, totalMunicipalities, totalCategories }: JobsHeaderProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-hero/10 px-3 py-1 text-xs md:text-sm shadow-soft">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-medium">Bolsa de trabajo Jujuy Conecta</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1">
              Oportunidades laborales reales en toda la provincia
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Encontrá trabajos formales, changas y propuestas locales. Sin humo, sin filtros raros,
              con datos claros para decidir mejor.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xs text-xs md:text-sm">
            <Card className="border-border/60 bg-card/80 shadow-none">
              <CardContent className="px-3 py-2 flex flex-col gap-0.5">
                <span className="text-lg font-semibold">{totalJobs}</span>
                <span className="text-[11px] text-muted-foreground">ofertas activas</span>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 shadow-none">
              <CardContent className="px-3 py-2 flex flex-col gap-0.5">
                <span className="text-lg font-semibold">{totalMunicipalities}</span>
                <span className="text-[11px] text-muted-foreground">municipios</span>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80 shadow-none">
              <CardContent className="px-3 py-2 flex flex-col gap-0.5">
                <span className="text-lg font-semibold">{totalCategories}</span>
                <span className="text-[11px] text-muted-foreground">rubros</span>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="min-w-[260px] max-w-sm border-dashed bg-card/90 shadow-soft">
          <CardContent className="pt-4 pb-4 flex flex-col gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="font-medium text-sm">¿Ofrecés trabajo?</p>
            </div>
            <p className="text-muted-foreground">
              Muy pronto vas a poder publicar tus búsquedas laborales, destacar tus avisos y
              recibir postulaciones directas desde Jujuy Conecta.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Publicá gratis tus avisos básicos.</li>
              <li>Pagá solo si querés destacarlos en portada.</li>
              <li>Conectá con gente que vive realmente en Jujuy.</li>
            </ul>
            <Badge variant="outline" className="self-start text-[11px]">
              Módulo empleadores próximamente
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Separator />
    </section>
  );
}
