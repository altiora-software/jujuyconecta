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
import { Plus, Edit, Trash2, Shield, AlertTriangle, Upload, Image as ImageIcon } from "lucide-react";
import * as XLSX from "xlsx";

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  image_url?: string | null;
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
    severity: "medium",
    image_url: ""
  });

  // Estados para importación masiva
  const [importOpen, setImportOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
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
        
        toast({ title: "Alerta actualizada", description: "Se actualizó correctamente" });
      } else {
        const { error } = await supabase
          .from("security_alerts")
          .insert([formData]);

        if (error) throw error;
        
        toast({ title: "Alerta creada", description: "Se creó correctamente" });
      }

      setIsDialogOpen(false);
      setEditingAlert(null);
      resetForm();
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error saving alert:", error);
      toast({ title: "Error", description: "No se pudo guardar la alerta", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      severity: "medium",
      image_url: ""
    });
  };

  const handleEdit = (alert: SecurityAlert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      description: alert.description,
      category: alert.category,
      severity: alert.severity,
      image_url: alert.image_url || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro de eliminar esta alerta?")) return;

    try {
      const { error } = await supabase.from("security_alerts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Alerta eliminada", description: "Se eliminó correctamente" });
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  // --- Importación Masiva ---
  const handleFile = async (file: File) => {
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    setParsedRows(rows);
  };

  const handleImport = async () => {
    if (!parsedRows.length) return;

    try {
      const { error } = await supabase
        .from("security_alerts")
        .upsert(parsedRows, { onConflict: "title" });

      if (error) throw error;

      toast({ title: "Importación completa", description: `${parsedRows.length} filas procesadas` });
      setImportOpen(false);
      setParsedRows([]);
      fetchAlerts();
      onUpdate();
    } catch (error) {
      console.error("Error importando:", error);
      toast({ title: "Error", description: "No se pudo importar", variant: "destructive" });
    }
  };

  const getSeverityColor = (severity: string) =>
    SEVERITY_LEVELS.find(s => s.value === severity)?.color || "bg-gray-500";

  const getSeverityLabel = (severity: string) =>
    SEVERITY_LEVELS.find(s => s.value === severity)?.label || severity;

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
                Administrá alertas sobre estafas, fraudes y seguridad ciudadana
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingAlert(null); resetForm(); }} className="gap-2">
                    <Plus className="h-4 w-4" /> Nueva Alerta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingAlert ? "Editar Alerta" : "Nueva Alerta"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Título"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Descripción completa"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                      <SelectContent>
                        {ALERT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                      <SelectTrigger><SelectValue placeholder="Gravedad" /></SelectTrigger>
                      <SelectContent>
                        {SEVERITY_LEVELS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <div className="flex gap-2 items-center">
                              <span className={`w-3 h-3 rounded-full ${s.color}`} /> {s.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="URL de imagen"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    <Button type="submit">{editingAlert ? "Actualizar" : "Crear"}</Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2"><Upload className="h-4 w-4" /> Importar XLSX</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Importación masiva</DialogTitle>
                    <DialogDescription>
                      Subí un archivo XLSX con las columnas: <code>title, description, category, severity, image_url</code>.
                    </DialogDescription>
                  </DialogHeader>
                  <Input type="file" accept=".xlsx" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }} />
                  {fileName && <p className="text-xs mt-2">Archivo: {fileName}</p>}
                  {parsedRows.length > 0 && (
                    <>
                      <p className="text-sm mt-3">Previsualización de {parsedRows.length} filas</p>
                      <div className="max-h-64 overflow-auto border rounded">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Título</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Gravedad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedRows.slice(0, 10).map((r, i) => (
                              <TableRow key={i}>
                                <TableCell>{r.title}</TableCell>
                                <TableCell>{r.category}</TableCell>
                                <TableCell>{r.severity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                  <Button onClick={handleImport} disabled={!parsedRows.length} className="mt-3">
                    Importar {parsedRows.length} filas
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
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
                  <TableHead>Imagen</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{ALERT_CATEGORIES.find(c => c.value === a.category)?.label || a.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${getSeverityColor(a.severity)}`} />
                        {getSeverityLabel(a.severity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.image_url ? (
                        <img src={a.image_url} alt="alerta" className="h-12 w-12 object-cover rounded" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(a)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
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
