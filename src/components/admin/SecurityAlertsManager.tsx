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
import { Plus, Edit, Trash2, Shield, AlertTriangle } from "lucide-react";

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  active: boolean;
  featured: boolean;
  created_at: string;
}

interface SecurityAlertsManagerProps {
  onUpdate: () => void;
}

const ALERT_CATEGORIES = [
  { value: "phishing", label: "Phishing / Estafas Online" },
  { value: "grooming", label: "Grooming" },
  { value: "fraudes", label: "Fraudes Telefónicos" },
  { value: "robos", label: "Robos y Hurtos" },
  { value: "estafas_callejeras", label: "Estafas Callejeras" },
  { value: "ciberseguridad", label: "Ciberseguridad" },
  { value: "documentos", label: "Documentos y Trámites" },
  { value: "otros", label: "Otros" }
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Baja", color: "bg-green-500" },
  { value: "medium", label: "Media", color: "bg-yellow-500" },
  { value: "high", label: "Alta", color: "bg-orange-500" },
  { value: "critical", label: "Crítica", color: "bg-red-500" }
];

export const SecurityAlertsManager = ({ onUpdate }: SecurityAlertsManagerProps) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<SecurityAlert | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    severity: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las alertas de seguridad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAlert) {
        const { error } = await supabase
          .from("security_alerts")
          .update(formData)
          .eq("id", editingAlert.id);

        if (error) throw error;
        
        toast({
          title: "Alerta actualizada",
          description: "La alerta de seguridad se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from("security_alerts")
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Alerta creada",
          description: "La nueva alerta de seguridad se creó correctamente",
        });
      }

      setIsDialogOpen(false);
      setEditingAlert(null);
      resetForm();
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error saving alert:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la alerta de seguridad",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      severity: "medium"
    });
  };

  const handleEdit = (alert: SecurityAlert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      description: alert.description,
      category: alert.category,
      severity: alert.severity
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta alerta?")) return;

    try {
      const { error } = await supabase
        .from("security_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Alerta eliminada",
        description: "La alerta de seguridad se eliminó correctamente",
      });
      
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la alerta de seguridad",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("security_alerts")
        .update({ featured: !currentFeatured })
        .eq("id", id);

      if (error) throw error;
      
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error updating featured status:", error);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("security_alerts")
        .update({ active: !currentActive })
        .eq("id", id);

      if (error) throw error;
      
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const level = SEVERITY_LEVELS.find(s => s.value === severity);
    return level?.color || "bg-gray-500";
  };

  const getSeverityLabel = (severity: string) => {
    const level = SEVERITY_LEVELS.find(s => s.value === severity);
    return level?.label || severity;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestión de Alertas de Seguridad
              </CardTitle>
              <CardDescription>
                Administrá las alertas sobre estafas, fraudes y temas de seguridad digital
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingAlert(null);
                    resetForm();
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAlert ? "Editar Alerta" : "Nueva Alerta de Seguridad"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAlert ? "Modificá" : "Agregá"} los datos de la alerta de seguridad
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título de la Alerta *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nueva modalidad de estafa telefónica"
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
                          {ALERT_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Nivel de Gravedad *</Label>
                      <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar gravedad" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                                {level.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción Detallada *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción completa de la alerta, cómo identificarla y qué hacer para prevenirla"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingAlert ? "Actualizar" : "Crear"} Alerta
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
            <div className="text-center py-8">Cargando alertas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Gravedad</TableHead>
                  <TableHead>Destacada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{alert.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {alert.description.substring(0, 60)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ALERT_CATEGORIES.find(c => c.value === alert.category)?.label || alert.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <span className="text-sm">{getSeverityLabel(alert.severity)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={alert.featured ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFeatured(alert.id, alert.featured)}
                      >
                        {alert.featured ? (
                          <><AlertTriangle className="h-3 w-3 mr-1" />Destacada</>
                        ) : (
                          "Normal"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={alert.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(alert.id, alert.active)}
                      >
                        {alert.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(alert)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
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