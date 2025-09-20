import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TransportReport {
  id: string;
  message: string;
  severity: string;
  status: string;
  created_at: string;
  line_id: string;
  user_id: string | null;
  transport_lines: {
    number: string;
    name: string;
    color: string;
  };
  profiles: {
    full_name: string | null;
  } | null;
}

interface TransportReportsManagerProps {
  onUpdate: () => void;
}

const SEVERITY_LEVELS = [
  { value: "low", label: "Baja", color: "bg-green-500" },
  { value: "medium", label: "Media", color: "bg-yellow-500" },
  { value: "high", label: "Alta", color: "bg-red-500" }
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activo", variant: "default" as const },
  { value: "resolved", label: "Resuelto", variant: "secondary" as const },
  { value: "dismissed", label: "Descartado", variant: "outline" as const }
];

export const TransportReportsManager = ({ onUpdate }: TransportReportsManagerProps) => {
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("transport_reports")
        .select(`
          *,
          transport_lines (number, name, color),
          profiles (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes de transporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("transport_reports")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Estado actualizado",
        description: "El estado del reporte se actualizó correctamente",
      });
      
      fetchReports();
      onUpdate();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reporte",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar este reporte?")) return;

    try {
      const { error } = await supabase
        .from("transport_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Reporte eliminado",
        description: "El reporte se eliminó correctamente",
      });
      
      fetchReports();
      onUpdate();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte",
        variant: "destructive",
      });
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

  const getStatusConfig = (status: string) => {
    const config = STATUS_OPTIONS.find(s => s.value === status);
    return config || STATUS_OPTIONS[0];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Gestión de Reportes de Transporte
          </CardTitle>
          <CardDescription>
            Administrá los reportes ciudadanos sobre el estado del transporte público
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando reportes...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reportes de transporte registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Línea</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Gravedad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: report.transport_lines.color }}
                        />
                        <div>
                          <div className="font-medium">{report.transport_lines.number}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.transport_lines.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{report.message}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(report.severity)}`} />
                        <span className="text-sm">{getSeverityLabel(report.severity)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {report.profiles?.full_name || "Usuario anónimo"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusConfig(report.status).variant}>
                        {getStatusConfig(report.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {report.status === 'active' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              title="Marcar como resuelto"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'dismissed')}
                              title="Descartar reporte"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {report.status === 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReportStatus(report.id, 'active')}
                            title="Reactivar reporte"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        {report.status === 'dismissed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReportStatus(report.id, 'active')}
                            title="Reactivar reporte"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                          title="Eliminar reporte"
                        >
                          <X className="h-4 w-4" />
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