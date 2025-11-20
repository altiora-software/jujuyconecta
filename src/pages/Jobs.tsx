import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  Search,
  Clipboard,
  ClipboardCheck,
  Info,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JobSubmissionDialog from "@/components/jobs/JobSubmissionDialog";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "formal" | "informal";
  salary_range: string | null;
  location: string;
  contact_info: string;
  requirements: string | null;
  active: boolean;
  featured: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedType, setSelectedType] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toast } = useToast();

  const categories = [
    { value: "todos", label: "Todas las categorías" },
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

  const types = [
    { value: "todos", label: "Todos" },
    { value: "formal", label: "Formal" },
    { value: "informal", label: "Informal" },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, searchQuery, selectedCategory, selectedType]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setJobs(data as Job[]);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las ofertas laborales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "todos") {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    if (selectedType !== "todos") {
      filtered = filtered.filter((job) => job.type === selectedType);
    }

    setFilteredJobs(filtered);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  const getTypeLabel = (type: string) => {
    return type === "formal" ? "Formal" : "Informal";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 3 && diffDays > 0;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const copyContact = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
      toast({
        title: "Contacto copiado",
        description: "Pegalo en WhatsApp, mail o donde quieras.",
      });
    } catch {
      // ignore
    }
  };

  const featuredJobs = filteredJobs.filter((j) => j.featured);
  const regularJobs = filteredJobs.filter((j) => !j.featured);
  const formalCount = jobs.filter((j) => j.type === "formal").length;
  const informalCount = jobs.filter((j) => j.type === "informal").length;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6">
            <div className="h-32 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-background animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-3xl bg-muted/70 border border-border/60 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/10 via-background to-background" />
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Hero */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)] items-stretch">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-background to-background p-6 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <div className="absolute -right-20 -top-10 h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl" />
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/25 border border-emerald-300/60">
                  <Briefcase className="h-5 w-5 text-black-50" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-[0.2em] text-black-100/80">
                    Bolsa de Trabajo
                  </p>
                  <p className="text-xs text-black-100/70">
                    Jujuy Conecta · Oportunidades reales
                  </p>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black-50 mb-3">
                Empleos formales e informales en Jujuy
              </h1>
              <p className="text-sm md:text-base text-black-50/85 max-w-xl mb-4">
                Busques un trabajo en blanco o un laburo por día, acá se
                encuentran personas y oportunidades. Todo organizado por
                categoría, tipo y ciudad.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge
                  variant="outline"
                  className="border-emerald-300/60 bg-emerald-500/15 text-black-50 text-xs"
                >
                  {jobs.length} ofertas activas
                </Badge>
                <Badge
                  variant="outline"
                  className="border-sky-300/60 bg-sky-500/10 text-black-50 text-xs"
                >
                  {formalCount} formales · {informalCount} informales
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-300/60 bg-amber-500/10 text-amber-50 text-xs inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Publicaciones revisadas
                </Badge>
              </div>
            </div>

            {/* Panel lateral: explicación + CTA */}
            <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Informal</strong>: oficios y trabajos por cuenta
                      propia, por día o por servicio. Ejemplo: plomería,
                      electricidad, jardinería, niñera, chofer, limpieza, etc.
                    </p>
                    <p>
                      <strong>Formal</strong>: búsquedas de empresas, comercios,
                      estudios, instituciones o empleos registrados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <JobSubmissionDialog
                  triggerLabel="Publicar oferta (revisión)"
                  onSubmitted={() => {
                    // se podría mostrar un toast si querés
                  }}
                />
                <p className="text-[11px] text-muted-foreground">
                  Las ofertas enviadas pasan por una revisión rápida antes de
                  mostrarse en la bolsa.
                </p>
              </div>
            </div>
          </section>

          {/* Filtros */}
          <section>
            <Card className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-sm">
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium text-sm">Filtrar empleos</span>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr),auto] items-center">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por puesto, descripción o ciudad..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-sm"
                    />
                  </div>

                  {/* Categoría */}
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.value}
                          value={category.value}
                          className="text-sm"
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tipo */}
                  <Select
                    value={selectedType}
                    onValueChange={setSelectedType}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-sm"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs md:text-sm text-muted-foreground text-right">
                    {filteredJobs.length} empleo
                    {filteredJobs.length !== 1 && "s"} encontrado
                    {filteredJobs.length !== 1 && "s"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Listado */}
          <section className="space-y-6">
            {/* Destacados como carrusel */}
            {featuredJobs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-primary/15 border border-primary/40">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </span>
                    Ofertas destacadas
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Seleccionadas por relevancia y vigencia
                  </p>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {featuredJobs.map((job) => {
                    const expired = isExpired(job.expires_at);
                    const expiringSoon = isExpiringSoon(job.expires_at);
                    const revealed = revealId === job.id;
                    const copied = copiedId === job.id;

                    return (
                      <article
                        key={job.id}
                        className={`snap-start min-w-[260px] max-w-sm md:max-w-md flex-shrink-0 rounded-3xl border bg-gradient-to-br from-emerald-500/8 via-background to-sky-500/8 shadow-lg shadow-black/10 overflow-hidden group ${
                          expired ? "opacity-70" : ""
                        }`}
                      >
                        <CardContent className="p-4 md:p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge className="bg-gradient-hero text-white text-[11px] px-2 py-0.5">
                                  Destacado
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[11px] px-2 py-0.5"
                                >
                                  {getCategoryLabel(job.category)}
                                </Badge>
                                <Badge
                                  variant={
                                    job.type === "formal"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-[11px] px-2 py-0.5"
                                >
                                  {getTypeLabel(job.type)}
                                </Badge>
                                {expiringSoon && !expired && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[11px] px-2 py-0.5"
                                  >
                                    Expira pronto
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-base md:text-lg font-semibold line-clamp-2">
                                {job.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>

                            {job.salary_range && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{job.salary_range}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Publicado {formatDate(job.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60">
                            <p className="text-[11px] text-muted-foreground">
                              {job.expires_at
                                ? expired
                                  ? "Expirado"
                                  : `Expira: ${formatDate(job.expires_at)}`
                                : "Sin fecha de vencimiento"}
                            </p>

                            {!revealed ? (
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setRevealId(job.id)}
                              >
                                Ver contacto
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs md:text-sm">
                                  {job.contact_info}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() =>
                                    copyContact(job.id, job.contact_info)
                                  }
                                >
                                  {copied ? (
                                    <>
                                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                                      Copiado
                                    </>
                                  ) : (
                                    <>
                                      <Clipboard className="h-3.5 w-3.5 mr-1" />
                                      Copiar
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Todas las ofertas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  Todas las oportunidades
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Tocá una oferta para ver requisitos y copiar el contacto
                </p>
              </div>

              {filteredJobs.length === 0 ? (
                <Card className="rounded-3xl border-dashed">
                  <CardContent className="p-10 text-center space-y-3">
                    <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-medium">
                      No hay ofertas que coincidan ahora
                    </p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Probá cambiando los filtros o volvé más tarde. Solemos
                      sumar nuevas oportunidades todas las semanas.
                    </p>
                    <div className="pt-2">
                      <JobSubmissionDialog triggerLabel="Publicar tu oportunidad" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {regularJobs.map((job) => {
                    const expired = isExpired(job.expires_at);
                    const expiringSoon = isExpiringSoon(job.expires_at);
                    const revealed = revealId === job.id;
                    const copied = copiedId === job.id;

                    return (
                      <article
                        key={job.id}
                        className={`group relative rounded-3xl border bg-gradient-to-br from-emerald-500/5 via-background to-sky-500/5 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-transform duration-200 ${
                          expired ? "opacity-70" : ""
                        }`}
                      >
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className="text-[11px] px-2 py-0.5"
                                >
                                  {getCategoryLabel(job.category)}
                                </Badge>
                                <Badge
                                  variant={
                                    job.type === "formal"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-[11px] px-2 py-0.5"
                                >
                                  {getTypeLabel(job.type)}
                                </Badge>
                                {expiringSoon && !expired && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[11px] px-2 py-0.5"
                                  >
                                    Expira pronto
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-base md:text-lg font-semibold line-clamp-2">
                                {job.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>

                            {job.salary_range && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{job.salary_range}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Publicado {formatDate(job.created_at)}</span>
                            </div>
                          </div>

                          {job.requirements && (
                            <div className="pt-2 border-t border-border/60">
                              <p className="text-xs md:text-sm">
                                <span className="font-medium">Requisitos: </span>
                                <span className="text-muted-foreground">
                                  {job.requirements}
                                </span>
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-border/60">
                            {job.expires_at && (
                              <p className="text-[11px] text-muted-foreground">
                                {expired
                                  ? "Expirado"
                                  : `Expira: ${formatDate(job.expires_at)}`}
                              </p>
                            )}

                            {!revealed ? (
                              <Button
                                size="sm"
                                className="ml-auto h-8 text-xs"
                                onClick={() => setRevealId(job.id)}
                              >
                                Ver contacto
                              </Button>
                            ) : (
                              <div className="ml-auto flex items-center gap-2">
                                <span className="text-xs md:text-sm">
                                  {job.contact_info}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() =>
                                    copyContact(job.id, job.contact_info)
                                  }
                                >
                                  {copied ? (
                                    <>
                                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                                      Copiado
                                    </>
                                  ) : (
                                    <>
                                      <Clipboard className="h-3.5 w-3.5 mr-1" />
                                      Copiar
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
