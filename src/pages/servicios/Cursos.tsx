"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import {
  BookOpen,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  Globe,
  Video,
  Users,
  CheckCircle2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  category: string;
  modality: "presencial" | "online" | "hibrido" | null;
  level: "inicio" | "intermedio" | "avanzado" | null;
  municipality: string | null;
  place_name: string | null;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
  schedule: string | null; // horario, días
  duration_hours: number | null;
  price_type: "gratis" | "pago" | null;
  price_detail: string | null;
  seats_available: number | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  website: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
  active: boolean | null;
  created_at?: string;
}

type TabId = "todos" | "presencial" | "online" | "gratis";

interface CourseSubmissionForm {
  name: string;
  email: string;
  whatsapp: string;
  courseTitle: string;
  modality: "presencial" | "online" | "hibrido" | "";
  municipality: string;
  message: string;
}

const INITIAL_SUBMISSION: CourseSubmissionForm = {
  name: "",
  email: "",
  whatsapp: "",
  courseTitle: "",
  modality: "",
  municipality: "",
  message: "",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<TabId>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("todos");

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [submission, setSubmission] = useState<CourseSubmissionForm>(INITIAL_SUBMISSION);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("active", true)
          .order("is_featured", { ascending: false })
          .order("start_date", { ascending: true });

        if (error) {
          console.error("Error cargando courses", error);
          toast({
            title: "Error al cargar cursos",
            description: "No se pudieron cargar las propuestas de formación. Probá de nuevo en unos minutos.",
            variant: "destructive",
          });
          return;
        }

        setCourses((data || []) as Course[]);
      } catch (err) {
        console.error("Error inesperado en CoursesPage", err);
        toast({
          title: "Error inesperado",
          description: "Ocurrió un problema cargando los datos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    courses.forEach((c) => c.category && s.add(c.category));
    return Array.from(s).sort();
  }, [courses]);

  const municipalities = useMemo(() => {
    const s = new Set<string>();
    courses.forEach((c) => c.municipality && s.add(c.municipality));
    return Array.from(s).sort();
  }, [courses]);

  const totalCourses = courses.length;
  const totalMunicipalities = municipalities.length;
  const totalCategories = categories.length;

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (selectedTab === "presencial" && course.modality !== "presencial") {
        return false;
      }
      if (selectedTab === "online" && course.modality !== "online") {
        return false;
      }
      if (selectedTab === "gratis" && course.price_type !== "gratis") {
        return false;
      }

      if (selectedCategory !== "todas" && course.category !== selectedCategory) {
        return false;
      }

      if (selectedMunicipality !== "todos" && course.municipality !== selectedMunicipality) {
        return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const stack = [
          course.title,
          course.short_description,
          course.long_description,
          course.category,
          course.municipality,
          course.place_name,
          course.tags?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!stack.includes(term)) return false;
      }

      return true;
    });
  }, [
    courses,
    selectedTab,
    selectedCategory,
    selectedMunicipality,
    searchTerm,
  ]);

  const handleOpenDetails = (course: Course) => {
    setSelectedCourse(course);
    setDetailsOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedTab("todos");
    setSelectedCategory("todas");
    setSelectedMunicipality("todos");
    setSearchTerm("");
  };

  const formatModality = (m: Course["modality"]) => {
    if (m === "presencial") return "Presencial";
    if (m === "online") return "Online";
    if (m === "hibrido") return "Híbrido";
    return "Modalidad a confirmar";
  };

  const formatLevel = (l: Course["level"]) => {
    if (l === "inicio") return "Nivel inicial";
    if (l === "intermedio") return "Nivel intermedio";
    if (l === "avanzado") return "Nivel avanzado";
    return null;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatPrice = (c: Course) => {
    if (c.price_type === "gratis") return "Gratuito";
    if (c.price_detail) return c.price_detail;
    return "Consultar valor";
  };

  const handleChangeSubmission = (field: keyof CourseSubmissionForm, value: string) => {
    setSubmission((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitCourse = async () => {
    if (!submission.name || !submission.email || !submission.courseTitle || !submission.modality) {
      toast({
        title: "Datos incompletos",
        description: "Nombre, mail, título del curso y modalidad son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
    //   const { error } = await supabase.from("course_submissions").insert({
    //     name: submission.name,
    //     email: submission.email,
    //     whatsapp: submission.whatsapp,
    //     course_title: submission.courseTitle,
    //     modality: submission.modality,
    //     municipality: submission.municipality || null,
    //     message: submission.message || null,
    //   });

    //   if (error) {
    //     console.error("Error al enviar course_submissions", error);
    //     toast({
    //       title: "No se pudo enviar tu curso",
    //       description: "Probá de nuevo en unos minutos.",
    //       variant: "destructive",
    //     });
    //     return;
    //   }

      toast({
        title: "Curso enviado para revisión",
        description: "Te vamos a contactar por mail o WhatsApp cuando esté publicado.",
      });
      setSubmission(INITIAL_SUBMISSION);
      setSubmissionOpen(false);
    } catch (err) {
      console.error("Error inesperado en envío de curso", err);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un problema al enviar el formulario.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-8">
        {/* Hero */}
        <section className="space-y-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs md:text-sm shadow-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Formación en Jujuy · Cursos y talleres</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                Cursos, talleres y capacitaciones
                <span className="text-primary"> para aprender y crecer en Jujuy.</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Encontrá propuestas presenciales y online de diferentes rubros.
                Desde oficios y ofimática hasta marketing, tecnología y desarrollo personal.
              </p>

              <div className="mt-2 grid grid-cols-3 gap-3 max-w-xs text-xs md:text-sm">
                <div className="rounded-lg border bg-card/70 px-3 py-2">
                  <p className="font-semibold">{totalCourses}</p>
                  <p className="text-muted-foreground text-[11px]">cursos activos</p>
                </div>
                <div className="rounded-lg border bg-card/70 px-3 py-2">
                  <p className="font-semibold">{totalMunicipalities}</p>
                  <p className="text-muted-foreground text-[11px]">municipios</p>
                </div>
                <div className="rounded-lg border bg-card/70 px-3 py-2">
                  <p className="font-semibold">{totalCategories}</p>
                  <p className="text-muted-foreground text-[11px]">categorías</p>
                </div>
              </div>
            </div>

            <Card className="min-w-[260px] max-w-sm border-dashed shadow-sm bg-gradient-to-b from-background to-muted/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  ¿Querés publicar tu curso?
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Podés mandarnos los datos y lo revisamos antes de publicarlo en la agenda de formación.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0 text-xs md:text-sm">
                <p className="text-muted-foreground">
                  Ideal para instituciones, academias, consultoras y profesionales independientes que
                  dictan talleres o capacitaciones.
                </p>
                <Button size="sm" className="w-full mt-1" onClick={() => setSubmissionOpen(true)}>
                  Enviar un curso para publicación
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Buscador y filtros */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tema, rubro, docente o municipio"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Limpiar filtros"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                className="h-9 rounded-md border bg-background px-3 text-xs md:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="todas">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="h-9 rounded-md border bg-background px-3 text-xs md:text-sm"
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
              >
                <option value="todos">Toda la provincia</option>
                {municipalities.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Tabs y listado */}
        <section className="space-y-4">
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as TabId)}>
            <TabsList className="w-full flex flex-wrap gap-2 justify-start">
              <TabsTrigger
                value="todos"
                className="flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-sm"
              >
                <BookOpen className="h-4 w-4" />
                <span>Todos</span>
              </TabsTrigger>
              <TabsTrigger
                value="presencial"
                className="flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>Presenciales</span>
              </TabsTrigger>
              <TabsTrigger
                value="online"
                className="flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-sm"
              >
                <Video className="h-4 w-4" />
                <span>Online</span>
              </TabsTrigger>
              <TabsTrigger
                value="gratis"
                className="flex items-center gap-2 text-xs md:text-sm data-[state=active]:shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Gratuitos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse rounded-xl">
                      <CardHeader className="pb-3">
                        <div className="h-4 w-40 bg-muted rounded mb-2" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-3/4 bg-muted rounded" />
                        <div className="flex gap-2 pt-2">
                          <div className="h-6 w-16 bg-muted rounded-full" />
                          <div className="h-6 w-20 bg-muted rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">No encontramos cursos con estos filtros.</p>
                    <p className="text-sm text-muted-foreground">
                      Probá con otra palabra o cambiá la modalidad, categoría o municipio.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Quitar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course) => {
                    const start = formatDate(course.start_date);
                    const end = formatDate(course.end_date);
                    const levelLabel = formatLevel(course.level);

                    return (
                      <Card
                        key={course.id}
                        className={`group flex flex-col rounded-xl border bg-card/80 backdrop-blur hover:shadow-lg transition-all hover:-translate-y-[2px] ${
                          course.is_featured ? "border-primary/70" : "border-border"
                        }`}
                      >
                        <CardHeader className="pb-2 pt-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <CardTitle className="text-base md:text-lg line-clamp-2">
                                {course.title}
                              </CardTitle>
                              <CardDescription className="text-xs md:text-sm line-clamp-3">
                                {course.short_description || course.long_description}
                              </CardDescription>
                            </div>
                            {course.is_featured && (
                              <Badge className="text-[10px] md:text-xs bg-primary/90 text-white">
                                Destacado
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 pb-3 flex-1 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs md:text-[13px] text-muted-foreground">
                            <Badge variant="outline" className="flex items-center gap-1 text-[11px] border-dashed">
                              <GraduationCap className="h-3 w-3" />
                              {course.category || "Formación general"}
                            </Badge>

                            <Badge variant="secondary" className="text-[11px] flex items-center gap-1">
                              {course.modality === "online" && <Video className="h-3 w-3" />}
                              {course.modality === "presencial" && <MapPin className="h-3 w-3" />}
                              {course.modality === "hibrido" && <Globe className="h-3 w-3" />}
                              {formatModality(course.modality)}
                            </Badge>

                            {course.municipality && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {course.municipality}
                              </span>
                            )}

                            {course.price_type === "gratis" && (
                              <Badge className="text-[11px] bg-emerald-500 text-white">
                                Gratis
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            {start && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {end ? `${start} · ${end}` : `Desde ${start}`}
                              </span>
                            )}
                            {course.schedule && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.schedule}
                              </span>
                            )}
                            {levelLabel && (
                              <Badge variant="outline" className="text-[10px]">
                                {levelLabel}
                              </Badge>
                            )}
                          </div>

                          {course.tags && course.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {course.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[10px] md:text-[11px] font-normal"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                              {course.tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{course.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                              {formatPrice(course)}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-xs md:text-sm"
                              onClick={() => handleOpenDetails(course)}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Dialog detalles de curso */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-xl">
            {selectedCourse && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {selectedCourse.title}
                  </DialogTitle>
                  <DialogDescription className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {selectedCourse.category || "Formación"}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedCourse.modality === "online" && <Video className="h-3 w-3" />}
                        {selectedCourse.modality === "presencial" && <MapPin className="h-3 w-3" />}
                        {selectedCourse.modality === "hibrido" && <Globe className="h-3 w-3" />}
                        {formatModality(selectedCourse.modality)}
                      </Badge>
                      {selectedCourse.municipality && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {selectedCourse.municipality}
                        </span>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm">
                  {(selectedCourse.short_description || selectedCourse.long_description) && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedCourse.long_description || selectedCourse.short_description}
                    </p>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Fechas y horarios
                      </p>
                      <p className="text-muted-foreground">
                        {formatDate(selectedCourse.start_date)
                          ? selectedCourse.end_date
                            ? `Desde ${formatDate(selectedCourse.start_date)} hasta ${formatDate(
                                selectedCourse.end_date
                              )}`
                            : `Desde ${formatDate(selectedCourse.start_date)}`
                          : "Fechas a confirmar"}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedCourse.schedule || "Horario a confirmar"}
                      </p>
                      {selectedCourse.duration_hours && (
                        <p className="text-muted-foreground">
                          Duración estimada: {selectedCourse.duration_hours} horas
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Información general
                      </p>
                      <p className="text-muted-foreground">
                        {formatLevel(selectedCourse.level) || "Nivel abierto"}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedCourse.price_type === "gratis"
                          ? "Curso gratuito"
                          : selectedCourse.price_detail || "Consultar valor"}
                      </p>
                      {selectedCourse.seats_available != null && (
                        <p className="text-muted-foreground">
                          Cupos aproximados: {selectedCourse.seats_available}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedCourse.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Lugar</p>
                        {selectedCourse.place_name && (
                          <p className="text-muted-foreground">{selectedCourse.place_name}</p>
                        )}
                        <p className="text-muted-foreground">{selectedCourse.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    {(selectedCourse.contact_whatsapp || selectedCourse.contact_email) && (
                      <div className="space-y-1">
                        <p className="font-medium">Contacto</p>
                        {selectedCourse.contact_whatsapp && (
                          <p className="text-muted-foreground">
                            WhatsApp: {selectedCourse.contact_whatsapp}
                          </p>
                        )}
                        {selectedCourse.contact_email && (
                          <p className="text-muted-foreground">
                            Mail: {selectedCourse.contact_email}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedCourse.website && (
                      <div className="space-y-1">
                        <p className="font-medium">Más información</p>
                        <button
                          type="button"
                          onClick={() => {
                            const url = selectedCourse.website?.startsWith("http")
                              ? selectedCourse.website
                              : `https://${selectedCourse.website}`;
                            window.open(url, "_blank");
                          }}
                          className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                        >
                          <Globe className="h-4 w-4" />
                          Ver sitio o formulario de inscripción
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog envío de curso */}
        <Dialog open={submissionOpen} onOpenChange={setSubmissionOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enviar un curso para publicación</DialogTitle>
              <DialogDescription>
                Completa los datos básicos. Vamos a revisar la información y, si está todo bien, lo
                sumamos a la agenda de formación de Jujuy Conecta.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nombre y apellido</label>
                  <Input
                    value={submission.name}
                    onChange={(e) => handleChangeSubmission("name", e.target.value)}
                    placeholder="Quién organiza o administra"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Correo de contacto</label>
                  <Input
                    type="email"
                    value={submission.email}
                    onChange={(e) => handleChangeSubmission("email", e.target.value)}
                    placeholder="Para que podamos escribirte"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">WhatsApp</label>
                  <Input
                    value={submission.whatsapp}
                    onChange={(e) => handleChangeSubmission("whatsapp", e.target.value)}
                    placeholder="Con característica, sin 0 ni 15"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Municipio</label>
                  <Input
                    value={submission.municipality}
                    onChange={(e) => handleChangeSubmission("municipality", e.target.value)}
                    placeholder="San Salvador, Palpalá, etc."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Título del curso o taller</label>
                <Input
                  value={submission.courseTitle}
                  onChange={(e) => handleChangeSubmission("courseTitle", e.target.value)}
                  placeholder="Ejemplo: Taller de Community Manager para emprendedores"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Modalidad</label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-xs md:text-sm"
                  value={submission.modality}
                  onChange={(e) =>
                    handleChangeSubmission("modality", e.target.value as CourseSubmissionForm["modality"])
                  }
                >
                  <option value="">Elegir modalidad</option>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Mensaje o detalles</label>
                <Textarea
                  value={submission.message}
                  onChange={(e) => handleChangeSubmission("message", e.target.value)}
                  placeholder="Contanos fechas estimadas, duración, precio y cualquier otro detalle importante."
                  rows={4}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSubmissionOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSubmitCourse} disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar curso"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
