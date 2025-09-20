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
import { Plus, Edit, Trash2, Building, MapPin, CheckCircle } from "lucide-react";

interface SocialResource {
  id: string;
  name: string;
  type: string;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  schedule: string | null;
  needs: string[] | null;
  verified: boolean;
  active: boolean;
  created_at: string;
}

interface SocialResourcesManagerProps {
  onUpdate: () => void;
}

const RESOURCE_TYPES = [
  { value: "comedor", label: "Comedor Comunitario" },
  { value: "merendero", label: "Merendero" },
  { value: "ong", label: "ONG" },
  { value: "centro_salud", label: "Centro de Salud" },
  { value: "escuela", label: "Escuela/Centro Educativo" },
  { value: "otros", label: "Otros" }
];

export const SocialResourcesManager = ({ onUpdate }: SocialResourcesManagerProps) => {
  const [resources, setResources] = useState<SocialResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<SocialResource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    contact_phone: "",
    contact_email: "",
    schedule: "",
    needs: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("social_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los recursos sociales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resourceData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        needs: formData.needs ? formData.needs.split(",").map(n => n.trim()) : []
      };

      if (editingResource) {
        const { error } = await supabase
          .from("social_resources")
          .update(resourceData)
          .eq("id", editingResource.id);

        if (error) throw error;
        
        toast({
          title: "Recurso actualizado",
          description: "El recurso social se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from("social_resources")
          .insert([resourceData]);

        if (error) throw error;
        
        toast({
          title: "Recurso creado",
          description: "El nuevo recurso social se creó correctamente",
        });
      }

      setIsDialogOpen(false);
      setEditingResource(null);
      resetForm();
      fetchResources();
      onUpdate();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el recurso social",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      contact_phone: "",
      contact_email: "",
      schedule: "",
      needs: ""
    });
  };

  const handleEdit = (resource: SocialResource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      description: resource.description || "",
      address: resource.address,
      latitude: resource.latitude?.toString() || "",
      longitude: resource.longitude?.toString() || "",
      contact_phone: resource.contact_phone || "",
      contact_email: resource.contact_email || "",
      schedule: resource.schedule || "",
      needs: resource.needs?.join(", ") || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar este recurso?")) return;

    try {
      const { error } = await supabase
        .from("social_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Recurso eliminado",
        description: "El recurso social se eliminó correctamente",
      });
      
      fetchResources();
      onUpdate();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el recurso social",
        variant: "destructive",
      });
    }
  };

  const toggleVerified = async (id: string, currentVerified: boolean) => {
    try {
      const { error } = await supabase
        .from("social_resources")
        .update({ verified: !currentVerified })
        .eq("id", id);

      if (error) throw error;
      
      fetchResources();
      onUpdate();
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("social_resources")
        .update({ active: !currentActive })
        .eq("id", id);

      if (error) throw error;
      
      fetchResources();
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
                <Building className="h-5 w-5" />
                Gestión de Recursos Sociales
              </CardTitle>
              <CardDescription>
                Administrá comedores, merenderos, ONG y otros recursos comunitarios
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingResource(null);
                    resetForm();
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Recurso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingResource ? "Editar Recurso" : "Nuevo Recurso Social"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingResource ? "Modificá" : "Agregá"} los datos del recurso social
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Comedor Los Pequeños"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOURCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Av. Belgrano 123, San Salvador de Jujuy"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitud</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="-24.1857"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitud</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="-65.2995"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Breve descripción del recurso y servicios que ofrece"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Teléfono</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="388-4123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="contacto@recurso.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule">Horarios</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      placeholder="Lunes a Viernes 12:00 a 14:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="needs">Necesidades Actuales</Label>
                    <Textarea
                      id="needs"
                      value={formData.needs}
                      onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                      placeholder="Alimentos no perecederos, ropa de abrigo, voluntarios (separar con comas)"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingResource ? "Actualizar" : "Crear"} Recurso
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
            <div className="text-center py-8">Cargando recursos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        {resource.latitude && resource.longitude && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            Ubicación GPS
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {RESOURCE_TYPES.find(t => t.value === resource.type)?.label || resource.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {resource.address}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={resource.verified ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleVerified(resource.id, resource.verified)}
                      >
                        {resource.verified ? (
                          <><CheckCircle className="h-3 w-3 mr-1" />Verificado</>
                        ) : (
                          "Sin verificar"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={resource.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(resource.id, resource.active)}
                      >
                        {resource.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(resource)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resource.id)}
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