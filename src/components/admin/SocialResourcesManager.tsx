import { useEffect, useMemo, useState, useCallback } from "react";
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
import { Plus, Edit, Trash2, Building, MapPin, CheckCircle, Upload, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

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
  { value: "otros", label: "Otros" },
];

// ---- TIPOS XLSX ----
type XLSXRow = {
  name?: string;
  address?: string;
  phone?: string;
  notes?: string;
};

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
    needs: "",
  });

  // ---- IMPORT XLSX UI state ----
  const [importOpen, setImportOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });

  // UX mejorada
  const [activeTab, setActiveTab] = useState<"resumen" | "errores" | "preview">("resumen");
  const [onlyInvalid, setOnlyInvalid] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

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
        needs: formData.needs ? formData.needs.split(",").map((n) => n.trim()).filter(Boolean) : [],
      };

      if (editingResource) {
        const { error } = await supabase.from("social_resources").update(resourceData).eq("id", editingResource.id);
        if (error) throw error;

        toast({ title: "Recurso actualizado", description: "El recurso social se actualizó correctamente" });
      } else {
        const { error } = await supabase.from("social_resources").insert([resourceData]);
        if (error) throw error;

        toast({ title: "Recurso creado", description: "El nuevo recurso social se creó correctamente" });
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
      needs: "",
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
      needs: resource.needs?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar este recurso?")) return;
    try {
      const { error } = await supabase.from("social_resources").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Recurso eliminado", description: "El recurso social se eliminó correctamente" });
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
      const { error } = await supabase.from("social_resources").update({ verified: !currentVerified }).eq("id", id);
      if (error) throw error;
      fetchResources();
      onUpdate();
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase.from("social_resources").update({ active: !currentActive }).eq("id", id);
      if (error) throw error;
      fetchResources();
      onUpdate();
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  // ---------- IMPORT XLSX ----------
  const rowToRecord = (row: XLSXRow, sheetRowIdx: number) => {
    const errors: string[] = [];

    const name = (row.name ?? "").toString().trim();
    const address = (row.address ?? "").toString().trim();
    const phone = (row.phone ?? "").toString().trim();
    const notes = (row.notes ?? "").toString().trim();

    if (!name) errors.push(`Fila ${sheetRowIdx}: "name" vacío`);
    if (!address) errors.push(`Fila ${sheetRowIdx}: "address" vacío`);

    // Heurística para type
    const type = /^merendero/i.test(name) ? "merendero" : "ong";

    const record = {
      name,
      type,
      description: notes || null,
      address,
      latitude: null as number | null,
      longitude: null as number | null,
      contact_phone: phone || null,
      contact_email: null as string | null,
      schedule: null as string | null,
      needs: [] as string[],
      verified: false,
      active: true,
    };

    const preview = {
      name,
      address,
      phone,
      notes,
      type,
      active: true,
      verified: false,
    };

    return { record, errors, preview };
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["name", "address", "phone", "notes"],
      ["Merendero a Pulmón", "Avenida Puerto Argentino..., Barrio Malvinas Argentinas, San Salvador de Jujuy", "3885-5018949", "Comedor que alimenta a más de 300 personas"],
      ["Merendero Tierra de Valientes", "Loteo Remanente 1, Barrio Tupac Amaru, Alto Comedero, San Salvador de Jujuy", "", "Colecta solidaria para el Día del Niño"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "plantilla");
    XLSX.writeFile(wb, "plantilla_social_resources.xlsx");
  };

  const handleFile = async (file: File) => {
    setParsing(true);
    setImportErrors([]);
    setParsedRows([]);
    setStats({ total: 0, valid: 0, invalid: 0 });
    setFileName(file.name);
    setActiveTab("resumen");
    setOnlyInvalid(false);
    setQuery("");
    setPage(1);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<XLSXRow>(sheet, { defval: "" });

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
      setActiveTab("preview");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error al leer el XLSX",
        description: err?.message || "Revisá que el archivo tenga cabeceras: name, address, phone, notes.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const previewRows = useMemo(() => parsedRows, [parsedRows]);

  // helpers de UI (filtro/paginación/errores/progreso)
  const projectRows = useCallback((rows: any[]) => {
    let out = rows;
    if (onlyInvalid) out = out.filter((r) => !r.__valid);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((r) =>
        [r.name, r.address, r.phone, r.notes, r.type]
          .filter(Boolean)
          .some((v: string) => v.toString().toLowerCase().includes(q))
      );
    }
    return out;
  }, [onlyInvalid, query]);

  const totalPages = useCallback((rows: any[]) => {
    const filtered = projectRows(rows);
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [projectRows, pageSize]);

  const paginatedRows = useCallback((rows: any[]) => {
    const filtered = projectRows(rows);
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [page, pageSize, projectRows]);

  // import chunking
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
    setImportProgress({ current: 0, total: 0 });

    let ok = 0;
    let fail = 0;
    let lastError: any = null;

    try {
      const parts = chunk(toImport, 200);
      setImportProgress({ current: 0, total: parts.length });

      // ⚠️ Si agregás UNIQUE(name,address) cambiá 'name' por 'name,address'
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const { error } = await supabase
          .from("social_resources")
          .upsert(part, { onConflict: "name,address" })

        if (error) {
          fail += part.length;
          lastError = error;
        } else {
          ok += part.length;
        }
        setImportProgress({ current: i + 1, total: parts.length });
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
      await fetchResources();
      onUpdate();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error importando",
        description: err?.message || "Revisá la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setImportProgress(null);
      setImporting(false);
    }
  };

  const downloadErrorsCsv = (errors: string[]) => {
    if (!errors.length) return;
    const header = "row,error\n";
    const lines = errors.map((e) => {
      const m = e.match(/Fila\s+(\d+):\s*(.+)/i);
      if (m) return `${m[1]},"${m[2].replace(/"/g, '""')}"`;
      return `,"${e.replace(/"/g, '""')}"`;
    });
    const csv = header + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "errores_import_social_resources.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Gestión de Recursos Sociales
              </CardTitle>
              <CardDescription>
                Administrá comedores, merenderos, ONG y otros recursos comunitarios
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Plantilla XLSX */}
              <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4" />
                Plantilla .xlsx
              </Button>

              {/* Import XLSX */}
              <Dialog open={importOpen} onOpenChange={(o) => !importing && setImportOpen(o)}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Importar XLSX
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Importación masiva (name, address, phone, notes)</DialogTitle>
                    <DialogDescription>
                      Subí un .xlsx con las cabeceras exactas: <strong>name, address, phone, notes</strong>. <br />
                      Se guardará como: <code>name</code>, <code>address</code>, <code>contact_phone ⟵ phone</code>, <code>description ⟵ notes</code>. <br />
                      El <code>type</code> se infiere: “Merendero” ⟶ <code>merendero</code>; sino <code>ong</code>.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Header sticky con controles */}
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
                            placeholder="Buscar por name / address / phone"
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
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      <span>Total: <strong>{stats.total}</strong></span>
                      <span>Válidas: <strong className="text-emerald-600">{stats.valid}</strong></span>
                      <span>Inválidas: <strong className="text-red-600">{stats.invalid}</strong></span>
                      {parsing && <span className="text-muted-foreground">Leyendo archivo...</span>}
                      {importing && importProgress && (
                        <span className="flex items-center gap-2">
                          <div className="relative w-40 h-2 rounded bg-muted overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-2 bg-primary"
                              style={{ width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }}
                            />
                          </div>
                          <span>{importProgress.current}/{importProgress.total} lotes</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tabs ligeras */}
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

                  {activeTab === "resumen" && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Subí el archivo, revisá el resumen y usá la previsualización con filtros y paginación para validar.
                      </p>
                      <ul className="list-disc pl-5 text-sm">
                        <li>Cabeceras: <code>name, address, phone, notes</code>.</li>
                        <li>Las filas inválidas muestran el motivo en <strong>Errores</strong>.</li>
                        <li>El tipo se infiere automáticamente (podés editar luego desde el CRUD).</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === "errores" && (
                    <div className="rounded-md border p-3 max-h-[50vh] overflow-auto">
                      {importErrors.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No hay errores de validación.</div>
                      ) : (
                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                          {importErrors.map((er, i) => (
                            <li key={i} className="text-red-600">{er}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {activeTab === "preview" && (
                    <div className="space-y-2">
                      <div className="rounded-md border">
                        <div className="max-h-[55vh] overflow-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-background">
                              <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="w-20">Válida</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedRows(previewRows).map((r: any, idx: number) => (
                                <TableRow key={`${page}-${idx}`}>
                                  <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                                  <TableCell className="font-medium">{r.name}</TableCell>
                                  <TableCell className="max-w-[28rem] truncate" title={r.address}>{r.address}</TableCell>
                                  <TableCell className="whitespace-nowrap">{r.phone || "—"}</TableCell>
                                  <TableCell className="max-w-[20rem] truncate" title={r.notes || "—"}>{r.notes || "—"}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{r.type}</Badge>
                                  </TableCell>
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
                        <div className="flex items-center justify-between p-3 text-sm">
                          <span>
                            Página <strong>{page}</strong> de <strong>{totalPages(previewRows)}</strong>
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
                              onClick={() => setPage((p) => Math.min(totalPages(previewRows), p + 1))}
                              disabled={page >= totalPages(previewRows)}
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                    <DialogTitle>{editingResource ? "Editar Recurso" : "Nuevo Recurso Social"}</DialogTitle>
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
                          placeholder="Merendero Los Peques"
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
                        {RESOURCE_TYPES.find((t) => t.value === resource.type)?.label || resource.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{resource.address}</TableCell>
                    <TableCell>
                      <Badge
                        variant={resource.verified ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleVerified(resource.id, resource.verified)}
                      >
                        {resource.verified ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </>
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(resource)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(resource.id)}>
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
