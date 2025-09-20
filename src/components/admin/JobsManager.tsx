import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Briefcase, Star } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  location: string;
  salary_range: string | null;
  requirements: string | null;
  contact_info: string;
  active: boolean;
  featured: boolean;
  expires_at: string | null;
  created_at: string;
}

interface JobsManagerProps {
  onUpdate: () => void;
}

const JOB_CATEGORIES = [
  { value: "administrativa", label: "Administrativa" },
  { value: "comercio", label: "Comercio y Ventas" },
  { value: "construccion", label: "Construcción" },
  { value: "educacion", label: "Educación" },
  { value: "gastronomia", label: "Gastronomía" },
  { value: "limpieza", label: "Limpieza" },
  { value: "salud", label: "Salud" },
  { value: "seguridad", label: "Seguridad" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "transporte", label: "Transporte" },
  { value: "otros", label: "Otros" }
];

const JOB_TYPES = [
  { value: "formal", label: "Trabajo Formal" },
  { value: "informal", label: "Trabajo Informal" },
  { value: "temporal", label: "Trabajo Temporal" },
  { value: "freelance", label: "Freelance" }
];

export const JobsManager = ({ onUpdate }: JobsManagerProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "formal",
    location: "",
    salary_range: "",
    requirements: "",
    contact_info: "",
    expires_at: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las ofertas de empleo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData = {
        ...formData,
        expires_at: formData.expires_at || null
      };

      if (editingJob) {
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", editingJob.id);

        if (error) throw error;
        
        toast({
          title: "Empleo actualizado",
          description: "La oferta de empleo se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert([jobData]);

        if (error) throw error;
        
        toast({
          title: "Empleo creado",
          description: "La nueva oferta de empleo se creó correctamente",
        });
      }

      setIsDialogOpen(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
      onUpdate();
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la oferta de empleo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      type: "formal",
      location: "",
      salary_range: "",
      requirements: "",
      contact_info: "",
      expires_at: ""
    });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      category: job.category,
      type: job.type,
      location: job.location,
      salary_range: job.salary_range || "",
      requirements: job.requirements || "",
      contact_info: job.contact_info,
      expires_at: job.expires_at ? job.expires_at.split('T')[0] : ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta oferta?")) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Empleo eliminado",
        description: "La oferta de empleo se eliminó correctamente",
      });
      
      fetchJobs();
      onUpdate();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la oferta de empleo",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ featured: !currentFeatured })
        .eq("id", id);

      if (error) throw error;
      
      fetchJobs();
      onUpdate();
    } catch (error) {
      console.error("Error updating featured status:", error);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ active: !currentActive })
        .eq("id", id);

      if (error) throw error;
      
      fetchJobs();
      onUpdate();
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Gestión de Ofertas de Empleo
              </CardTitle>
              <CardDescription>
                Administrá las ofertas de trabajo formales e informales
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingJob(null);
                    resetForm();
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Oferta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? "Editar Oferta" : "Nueva Oferta de Empleo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingJob ? "Modificá" : "Agregá"} los datos de la oferta de empleo
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Puesto *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Vendedor/a con experiencia"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Trabajo *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="San Salvador de Jujuy"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_range">Rango Salarial</Label>
                      <Input
                        id="salary_range"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        placeholder="$300.000 - $400.000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción del Puesto *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción detallada del puesto y responsabilidades"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requisitos</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Experiencia previa, nivel educativo, habilidades específicas"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_info">Información de Contacto *</Label>
                      <Input
                        id="contact_info"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                        placeholder="WhatsApp: 388-4123456 o email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires_at">Fecha de Vencimiento</Label>
                      <Input
                        id="expires_at"
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingJob ? "Actualizar" : "Crear"} Oferta
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando ofertas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        {job.salary_range && (
                          <div className="text-xs text-muted-foreground">{job.salary_range}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {JOB_CATEGORIES.find(c => c.value === job.category)?.label || job.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {JOB_TYPES.find(t => t.value === job.type)?.label || job.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={job.featured ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFeatured(job.id, job.featured)}
                      >
                        {job.featured ? (
                          <><Star className="h-3 w-3 mr-1" />Destacado</>
                        ) : (
                          "Normal"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={job.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(job.id, job.active)}
                      >
                        {job.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};