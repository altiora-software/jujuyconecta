import { Plus, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TransportReport } from "./types";
import { getSeverityColor, getSeverityText } from "./transportUtils";

interface ReportsTabProps {
  reports: TransportReport[];
}

export function ReportsTab({ reports }: ReportsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reportes activos
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Demoras, desvíos y problemas reportados por la comunidad.
          </p>
        </div>
        <Button size="sm" disabled className="rounded-full text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nuevo reporte (próximamente)
        </Button>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="rounded-3xl border-dashed">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay reportes activos ahora mismo.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cuando haya desvíos o irregularidades, los vas a ver acá
                agrupados por línea.
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card
              key={report.id}
              className="rounded-3xl border bg-gradient-to-r from-destructive/5 via-background to-background"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getSeverityColor(report.severity)}>
                        {getSeverityText(report.severity)}
                      </Badge>
                      <span className="text-xs md:text-sm font-medium">
                        Línea {report.transport_lines.number} ·{" "}
                        {report.transport_lines.name}
                      </span>
                    </div>
                    <p className="text-sm">{report.message}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(report.created_at).toLocaleString("es-AR")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
