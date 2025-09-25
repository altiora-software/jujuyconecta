// app/empleos/page.tsx
import { Layout } from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Clock, DollarSign, Filter, Search, Clipboard, ClipboardCheck, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JobSubmissionDialog from "@/components/jobs/JobSubmissionDialog"; // ⬅️ NUEVO

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

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== "todos") {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    // Type
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
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
      toast({ title: "Contacto copiado", description: "Pegalo en WhatsApp, mail o donde quieras." });
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            <div className="grid gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header + explicación */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Bolsa de Trabajo</h1>
              <p className="text-muted-foreground">
                Oportunidades laborales <strong>formales</strong> e <strong>informales</strong> en Jujuy.
              </p>
            </div>
            {/* Botón para enviar oferta (revisión) */}
            <JobSubmissionDialog
              triggerLabel="Publicar oferta (revisión)"
              onSubmitted={() => {
                // Si querés refrescar algo acá, lo podés hacer.
                // No refresca el listado porque va a 'job_submissions' (pendientes).
              }}
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-primary" />
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Informal</strong>: trabajos o servicios ofrecidos por personas —por ejemplo{" "}
                  <em>plomero, electricista, gasista, albañil, jardinería, niñera, cuidado de adultos mayores,
                  limpieza, chofer por día</em>, etc.
                </p>
                <p>
                  <strong>Formal</strong>: búsquedas laborales de empresas, comercios, instituciones o
                  contrataciones registradas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filtros</span>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {/* <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar empleos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div> */}

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground flex items-center">
                  {filteredJobs.length} empleos encontrados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listado */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  No hay ofertas que coincidan ahora. ✨
                  <br />
                  Te invitamos a volver pronto: cargamos nuevas oportunidades todas las semanas.
                </p>
                <div>
                  {/* Botón también en el empty state */}
                  <JobSubmissionDialog triggerLabel="Publicar tu oportunidad" />
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const revealed = revealId === job.id;
              const copied = copiedId === job.id;
              return (
                <Card
                  key={job.id}
                  className={`hover:shadow-md transition-shadow ${job.featured ? "border-primary" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {job.featured && <Badge className="bg-gradient-hero text-white">Destacado</Badge>}
                            <Badge variant="outline">{getCategoryLabel(job.category)}</Badge>
                            <Badge variant={job.type === "formal" ? "default" : "secondary"}>
                              {getTypeLabel(job.type)}
                            </Badge>
                            {job.expires_at && isExpiringSoon(job.expires_at) && (
                              <Badge variant="destructive">Expira pronto</Badge>
                            )}
                          </div>

                          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                        </div>
                      </div>

                      {job.requirements && (
                        <div className="pt-2 border-t">
                          <p className="text-sm">
                            <span className="font-medium">Requisitos: </span>
                            <span className="text-muted-foreground">{job.requirements}</span>
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        {job.expires_at && (
                          <p className="text-xs text-muted-foreground">
                            {isExpired(job.expires_at) ? "Expirado" : `Expira: ${formatDate(job.expires_at)}`}
                          </p>
                        )}

                        {!revealed ? (
                          <Button className="ml-auto" onClick={() => setRevealId(job.id)}>
                            Ver contacto
                          </Button>
                        ) : (
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-sm">{job.contact_info}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyContact(job.id, job.contact_info)}
                            >
                              {copied ? (
                                <>
                                  <ClipboardCheck className="h-4 w-4 mr-1" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Clipboard className="h-4 w-4 mr-1" />
                                  Copiar
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
