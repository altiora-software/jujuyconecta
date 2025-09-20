import { useState, useEffect, useMemo } from "react";
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
import { Plus, Edit, Trash2, Bus, Upload, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { Progress } from "@radix-ui/react-progress";
import { Tabs } from "@radix-ui/react-tabs";

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

// --- NUEVOS TIPOS PARA EL XLSX (line, company, route, notes)
type XLSXRow = {
  line?: string | number;
  company?: string;
  route?: string;
  notes?: string;
};

export const TransportLinesManager = ({ onUpdate }: TransportLinesManagerProps) => {
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<TransportLine | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    route_description: "",
    color: "#2563EB",
  });

  const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(50);
const [query, setQuery] = useState("");
const [onlyInvalid, setOnlyInvalid] = useState(false);
const [activeTab, setActiveTab] = useState<"resumen" | "errores" | "preview">("resumen");
const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);


  // Import XLSX
  const [importOpen, setImportOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{ total: number; valid: number; invalid: number }>({
    total: 0,
    valid: 0,
    invalid: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    try {
      const { data, error } = await supabase.from("transport_lines").select("*").order("number");
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
        const { error } = await supabase.from("transport_lines").update(formData).eq("id", editingLine.id);
        if (error) throw error;

        toast({ title: "Línea actualizada", description: "La línea de transporte se actualizó correctamente" });
      } else {
        const { error } = await supabase.from("transport_lines").insert([formData]);
        if (error) throw error;

        toast({ title: "Línea creada", description: "La nueva línea de transporte se creó correctamente" });
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
      color: line.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta línea?")) return;
    try {
      const { error } = await supabase.from("transport_lines").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Línea eliminada", description: "La línea de transporte se eliminó correctamente" });
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
      const { error } = await supabase.from("transport_lines").update({ active: !currentActive }).eq("id", id);
    if (error) throw error;
      fetchLines();
      onUpdate();
    } catch (error) {
      console.error("Error updating line status:", error);
    }
  };

  // ---------- Import XLSX ----------
  const rowToRecord = (row: XLSXRow, sheetRowIdx: number) => {
    const errors: string[] = [];

    const number = (row.line ?? "").toString().trim();
    const company = (row.company ?? "").toString().trim();
    const route = (row.route ?? "").toString().trim();
    const notes = (row.notes ?? "").toString().trim();

    if (!number) errors.push(`Fila ${sheetRowIdx}: "line" vacío`);
    if (!company) errors.push(`Fila ${sheetRowIdx}: "company" vacío`);
    if (!route) errors.push(`Fila ${sheetRowIdx}: "route" vacío`);

    // Mapeo al esquema de la tabla actual
    const name = company; // guardamos la empresa en 'name'
    const route_description = notes ? `${route} — ${notes}` : route;
    const color = "#2563EB";
    const active = true;

    return {
      record: { number, name, route_description, color, active },
      errors,
      preview: { line: number, company, route, notes, color, active },
    };
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["line", "company", "route", "notes"],
      ["1B", "E.T.A.P.", "Terminal de Ómnibus - Villa Jardín de Reyes", "Servicio urbano en San Salvador de Jujuy"],
      ["1C", "E.T.A.P.", "Terminal de Ómnibus - Termas de Reyes", ""],
      ["2A", "Santa Ana", "Centro/Hospital de Niños - Barrio Islas Malvinas", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "plantilla");
    XLSX.writeFile(wb, "plantilla_transport_lines.xlsx");
  };

  const handleFile = async (file: File) => {
    setParsing(true);
    setImportErrors([]);
    setParsedRows([]);
    setStats({ total: 0, valid: 0, invalid: 0 });
    setFileName(file.name);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<XLSXRow>(sheet, { defval: "" }); // mantiene claves aunque vacías

      const results: any[] = [];
      const errors: string[] = [];
      let valid = 0;
      let invalid = 0;

      json.forEach((row, i) => {
        const idx = i + 2; // +2 por cabecera
        const { record, errors: rowErrors, preview } = rowToRecord(row, idx);
        if (rowErrors.length) {
          invalid++;
          errors.push(...rowErrors);
          results.push({ ...preview, __valid: false, __errors: rowErrors, __payload: record });
        } else {
          valid++;
          results.push({ ...preview, __valid: true, __payload: record });
        }
      });

      setParsedRows(results);
      setStats({ total: json.length, valid, invalid });
      setImportErrors(errors);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error al leer el XLSX",
        description: err?.message || "Revisá que el archivo tenga cabeceras: line, company, route, notes.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const previewRows = useMemo(() => parsedRows.slice(0, 60), [parsedRows]);

  const chunk = <T,>(arr: T[], size = 200): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const handleImport = async () => {
    if (!parsedRows.length) {
      toast({ title: "Sin datos", description: "Cargá un archivo primero." });
      return;
    }
    const toImport = parsedRows.filter((r) => r.__valid).map((r) => r.__payload);

    if (!toImport.length) {
      toast({
        title: "No hay filas válidas",
        description: "Corregí los errores del archivo y volvé a intentar.",
        variant: "destructive",
      });
      return;
    }




    setImporting(true);
    let ok = 0;
    let fail = 0;
    let lastError: any = null;

    try {
      const parts = chunk(toImport, 200);
      for (const part of parts) {
        // Upsert por number (recomendado UNIQUE(number))
        setImportProgress({ current: 0, total: parts.length });
        // al finalizar:
        setImportProgress(null);
        const { error } = await supabase.from("transport_lines").upsert(part, { onConflict: "number" });
        if (error) {
          fail += part.length;
          lastError = error;
        } else {
          ok += part.length;
        }
      }

      if (ok) toast({ title: "Importación completa", description: `Insertadas/actualizadas: ${ok}.` });
      if (fail)
        toast({
          title: "Algunas filas fallaron",
          description: `No se pudieron procesar ${fail} filas. ${lastError?.message || ""}`,
          variant: "destructive",
        });

      setImportOpen(false);
      setParsedRows([]);
      setImportErrors([]);
      setStats({ total: 0, valid: 0, invalid: 0 });
      setFileName("");
      await fetchLines();
      onUpdate();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error importando",
        description: err?.message || "Revisá la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };
      // Filtra y pagina sin mutar parsedRows
function projectRows(rows: any[], opts: { query: string; onlyInvalid: boolean }) {
  const q = opts.query.trim().toLowerCase();
  let out = rows;
  if (opts.onlyInvalid) out = out.filter((r) => !r.__valid);
  if (q) {
    out = out.filter((r) => {
      return (
        (r.line ?? "").toString().toLowerCase().includes(q) ||
        (r.company ?? "").toString().toLowerCase().includes(q) ||
        (r.route ?? "").toString().toLowerCase().includes(q) ||
        (r.notes ?? "").toString().toLowerCase().includes(q)
      );
    });
  }
  return out;
}


  function totalPages(rows: any[], opts: { pageSize: number; query: string; onlyInvalid: boolean }) {
    const filtered = projectRows(rows, { query: opts.query, onlyInvalid: opts.onlyInvalid });
    return Math.max(1, Math.ceil(filtered.length / opts.pageSize));
  }
  
  function paginatedRows(
    rows: any[],
    opts: { page: number; pageSize: number; query: string; onlyInvalid: boolean }
  ) {
    const filtered = projectRows(rows, { query: opts.query, onlyInvalid: opts.onlyInvalid });
    const start = (opts.page - 1) * opts.pageSize;
    return filtered.slice(start, start + opts.pageSize);
  }
  
  // Descarga CSV simple de errores
  function downloadErrorsCsv(errors: string[]) {
    if (!errors.length) return;
    const header = "row,error\n";
    // Intentamos extraer el número de fila si viene "Fila X: ..."
    const lines = errors.map((e) => {
      const m = e.match(/Fila\s+(\d+):\s*(.+)/i);
      if (m) return `${m[1]},"${m[2].replace(/"/g, '""')}"`;
      return `,"${e.replace(/"/g, '""')}"`;
    });
    const csv = header + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "errores_import_transport_lines.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Gestión de Líneas de Transporte
              </CardTitle>
              <CardDescription>Administrá las líneas de colectivos de la ciudad</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Plantilla XLSX (line, company, route, notes) */}
              <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4" />
                Plantilla .xlsx
              </Button>

              {/* Importar XLSX */}
              <Dialog open={importOpen} onOpenChange={(o) => !importing && setImportOpen(o)}>
  <DialogTrigger asChild>
    <Button variant="secondary" className="gap-2">
      <Upload className="h-4 w-4" />
      Importar XLSX
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-5xl">
    <DialogHeader>
      <DialogTitle>Importación masiva (line, company, route, notes)</DialogTitle>
      <DialogDescription>
        Subí un .xlsx con las cabeceras exactas: <strong>line, company, route, notes</strong>.
        <br />
        Se guardará en la base como: <code>number ⟵ line</code>, <code>name ⟵ company</code>, <code>route_description ⟵ route (+ notes)</code>.
      </DialogDescription>
    </DialogHeader>

    {/* Header sticky con file y acciones */}
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md p-3 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="xlsx">Archivo .xlsx</Label>
          <Input
            id="xlsx"
            type="file"
            accept=".xlsx"
            disabled={parsing || importing}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              setActiveTab("resumen");
            }}
          />
          {fileName && <p className="text-xs text-muted-foreground">Archivo: {fileName}</p>}
        </div>

        <div className="flex flex-col md:items-end gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOnlyInvalid((x) => !x);
                setActiveTab("preview");
              }}
              disabled={!parsedRows.length}
            >
              {onlyInvalid ? "Ver todas" : "Ver solo inválidas"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadErrorsCsv(importErrors)}
              disabled={!importErrors.length}
            >
              Descargar errores CSV
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Label className="text-xs">Filtrar</Label>
            <Input
              placeholder="Buscar por line / company / route"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
                setActiveTab("preview");
              }}
              className="h-8 w-56"
            />
            <select
              className="h-8 px-2 rounded-md border bg-background"
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(1);
                setActiveTab("preview");
              }}
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={200}>200 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen + Progreso */}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span>Total: <strong>{stats.total}</strong></span>
        <span>Válidas: <strong className="text-emerald-600">{stats.valid}</strong></span>
        <span>Inválidas: <strong className="text-red-600">{stats.invalid}</strong></span>
        {parsing && <span className="text-muted-foreground">Leyendo archivo...</span>}
        {importing && importProgress && (
          <span className="flex items-center gap-2">
            <Progress value={Math.round((importProgress.current / importProgress.total) * 100)} className="w-40" />
            <span>{importProgress.current}/{importProgress.total} lotes</span>
          </span>
        )}
      </div>
    </div>

    {/* Contenido tabulado */}
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
      <div className="border-b mb-3">
        <div className="flex gap-4">
          <button
            className={`py-2 text-sm ${activeTab === "resumen" ? "font-semibold text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("resumen")}
          >
            Resumen
          </button>
          <button
            className={`py-2 text-sm ${activeTab === "errores" ? "font-semibold text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("errores")}
          >
            Errores ({importErrors.length})
          </button>
          <button
            className={`py-2 text-sm ${activeTab === "preview" ? "font-semibold text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("preview")}
          >
            Previsualización ({parsedRows.length})
          </button>
        </div>
      </div>

      {/* TAB: Resumen */}
      {activeTab === "resumen" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Subí el archivo, revisá el resumen y luego pasá a la previsualización para verificar los datos. Podés filtrar y paginar para no perderte entre cientos o miles de filas.
          </p>
          <ul className="list-disc pl-5 text-sm">
            <li>Cabeceras requeridas: <code>line, company, route, notes</code>.</li>
            <li>Las filas inválidas muestran el motivo en la pestaña <strong>Errores</strong>.</li>
            <li>Usá “Ver solo inválidas” para concentrarte en lo que hay que corregir.</li>
          </ul>
        </div>
      )}

      {/* TAB: Errores */}
      {activeTab === "errores" && (
        <div className="rounded-md border p-3 max-h-[50vh] overflow-auto">
          {importErrors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay errores de validación.</div>
          ) : (
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              {importErrors.map((er, i) => (
                <li key={i} className="text-red-600">{ er }</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* TAB: Previsualización */}
      {activeTab === "preview" && (
        <div className="space-y-2">
          {/* Tabla paginada y filtrada */}
          <div className="rounded-md border">
            <div className="max-h-[55vh] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Line</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-20">Válida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows(parsedRows, { page, pageSize, query, onlyInvalid }).map((r: any, idx: number) => (
                    <TableRow key={`${page}-${idx}`}>
                      <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell className="font-mono">{r.line}</TableCell>
                      <TableCell>{r.company}</TableCell>
                      <TableCell className="max-w-[28rem] truncate" title={r.route}>{r.route}</TableCell>
                      <TableCell className="max-w-[20rem] truncate" title={r.notes || "—"}>{r.notes || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={r.__valid ? "default" : "destructive"}>
                          {r.__valid ? "OK" : "Inválida"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between p-3 text-sm">
              <span>
                Página <strong>{page}</strong> de <strong>{totalPages(parsedRows, { pageSize, query, onlyInvalid })}</strong>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages(parsedRows, { pageSize, query, onlyInvalid }), p + 1))}
                  disabled={page >= totalPages(parsedRows, { pageSize, query, onlyInvalid })}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Tabs>

    {/* Pie de acciones */}
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" onClick={() => !importing && setImportOpen(false)}>
        Cerrar
      </Button>
      <Button onClick={handleImport} disabled={importing || parsing || stats.valid === 0}>
        {importing
          ? (importProgress ? `Importando lote ${importProgress.current}/${importProgress.total}...` : "Importando...")
          : `Importar ${stats.valid} filas válidas`}
      </Button>
    </div>
  </DialogContent>
</Dialog>


              {/* Crear manual */}
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
                    <DialogTitle>{editingLine ? "Editar Línea" : "Nueva Línea de Transporte"}</DialogTitle>
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
                          placeholder="1, 2A, 6A Bis..."
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
                      <Label htmlFor="name">Empresa</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="E.T.A.P., Santa Ana, Unión Bus..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="route_description">Recorrido (y notas)</Label>
                      <Textarea
                        id="route_description"
                        value={formData.route_description}
                        onChange={(e) => setFormData({ ...formData, route_description: e.target.value })}
                        placeholder="Centro/Hospital de Niños - Barrio Islas Malvinas — Notas opcionales"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingLine ? "Actualizar" : "Crear"} Línea
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                  <TableHead>Empresa</TableHead>
                  <TableHead>Recorrido / Notas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: line.color }} />
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(line)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(line.id)}>
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
