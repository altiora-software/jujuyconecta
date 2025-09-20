import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Bus } from "lucide-react";

interface TransportLine {
  id: string;
  number: string;
  name: string;
  route_description: string | null;
  color: string;
  active: boolean;
  created_at: string;
}

interface TransportLinesManagerProps {
  onUpdate: () => void;
}

export const TransportLinesManager = ({ onUpdate }: TransportLinesManagerProps) => {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<TransportLine | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    route_description: "",
    color: "#2563EB"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    try {
      const { data, error } = await supabase
        .from("transport_lines")
        .select("*")
        .order("number");

      if (error) throw error;
      setLines(data || []);
    } catch (error) {
      console.error("Error fetching lines:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las líneas de transporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLine) {
        const { error } = await supabase
          .from("transport_lines")
          .update(formData)
          .eq("id", editingLine.id);

        if (error) throw error;
        
        toast({
          title: "Línea actualizada",
          description: "La línea de transporte se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from("transport_lines")
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Línea creada",
          description: "La nueva línea de transporte se creó correctamente",
        });
      }

      setIsDialogOpen(false);
      setEditingLine(null);
      setFormData({ number: "", name: "", route_description: "", color: "#2563EB" });
      fetchLines();
      onUpdate();
    } catch (error) {
      console.error("Error saving line:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la línea de transporte",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (line: TransportLine) => {
    setEditingLine(line);
    setFormData({
      number: line.number,
      name: line.name,
      route_description: line.route_description || "",
      color: line.color
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta línea?")) return;

    try {
      const { error } = await supabase
        .from("transport_lines")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Línea eliminada",
        description: "La línea de transporte se eliminó correctamente",
      });
      
      fetchLines();
      onUpdate();
    } catch (error) {
      console.error("Error deleting line:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la línea de transporte",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("transport_lines")
        .update({ active: !currentActive })
        .eq("id", id);

      if (error) throw error;
      
      fetchLines();
      onUpdate();
    } catch (error) {
      console.error("Error updating line status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Gestión de Líneas de Transporte
              </CardTitle>
              <CardDescription>
                Administrá las líneas de colectivos de la ciudad
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingLine(null);
                    setFormData({ number: "", name: "", route_description: "", color: "#2563EB" });
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Línea
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLine ? "Editar Línea" : "Nueva Línea de Transporte"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLine ? "Modificá" : "Agregá"} los datos de la línea de transporte
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        placeholder="1, 2A, Express..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Línea Centro - Palpalá"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="route_description">Descripción del Recorrido</Label>
                    <Textarea
                      id="route_description"
                      value={formData.route_description}
                      onChange={(e) => setFormData({ ...formData, route_description: e.target.value })}
                      placeholder="Centro - Av. Belgrano - Terminal - Palpalá"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingLine ? "Actualizar" : "Crear"} Línea
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
            <div className="text-center py-8">Cargando líneas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Recorrido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="font-medium">{line.number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{line.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {line.route_description || "Sin descripción"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={line.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(line.id, line.active)}
                      >
                        {line.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(line)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(line.id)}
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