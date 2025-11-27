// src/components/admin/marketplace/MarketplaceTableDesktop.tsx

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Instagram,
  Globe,
  MapPin,
  Tag as TagIcon,
  Truck,
  Edit,
  Trash2,
} from "lucide-react";
import type { LocalBusiness } from "./types";
import { BUSINESS_TYPES } from "./types";

interface MarketplaceTableDesktopProps {
  businesses: LocalBusiness[];
  onEdit: (b: LocalBusiness) => void;
  onDelete: (id: string) => void;
  onToggleDelivery: (id: string, current: boolean | null) => void;
}

export function MarketplaceTableDesktop({
  businesses,
  onEdit,
  onDelete,
  onToggleDelivery,
}: MarketplaceTableDesktopProps) {
  if (businesses.length === 0) return null;

  return (
    <div className="hidden md:block">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rubro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Envío</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{b.name}</div>
                    {b.address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{b.address}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{b.category}</Badge>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">
                    {
                      BUSINESS_TYPES.find((t) => t.value === b.type)?.label ??
                      b.type
                    }
                  </Badge>
                </TableCell>

                <TableCell>{b.municipality}</TableCell>

                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    {b.whatsapp && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {b.whatsapp}
                      </span>
                    )}
                    {b.instagram && (
                      <span className="inline-flex items-center gap-1">
                        <Instagram className="h-3 w-3" />
                        {b.instagram}
                      </span>
                    )}
                    {b.website && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {b.website}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={b.has_delivery ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => onToggleDelivery(b.id, b.has_delivery)}
                  >
                    <Truck className="h-3 w-3" />
                    {b.has_delivery ? "Con envío" : "Sin info"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {b.tags && b.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {b.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[11px] flex items-center gap-1"
                        >
                          <TagIcon className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                      {b.tags.length > 3 && (
                        <span className="text-[11px] text-muted-foreground">
                          +{b.tags.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      Sin tags
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(b)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
