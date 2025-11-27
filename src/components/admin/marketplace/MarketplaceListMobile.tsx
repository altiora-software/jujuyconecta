// src/components/admin/marketplace/MarketplaceListMobile.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Instagram, Globe, MapPin, Tag as TagIcon, Truck, Edit, Trash2 } from "lucide-react";
import type { LocalBusiness } from "./types";
import { BUSINESS_TYPES } from "./types";

interface MarketplaceListMobileProps {
  businesses: LocalBusiness[];
  onEdit: (b: LocalBusiness) => void;
  onDelete: (id: string) => void;
  onToggleDelivery: (id: string, current: boolean | null) => void;
}

export function MarketplaceListMobile({
  businesses,
  onEdit,
  onDelete,
  onToggleDelivery,
}: MarketplaceListMobileProps) {
  return (
    <div className="space-y-3 md:hidden">
      {businesses.map((b) => (
        <Card
          key={b.id}
          className="border rounded-lg px-3 py-3 shadow-sm bg-card"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="font-semibold text-sm leading-tight">
                {b.name}
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                <Badge variant="outline" className="px-2 py-0 h-5 text-[10px]">
                  {b.category}
                </Badge>
                <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px]">
                  {
                    BUSINESS_TYPES.find((t) => t.value === b.type)?.label ??
                    b.type
                  }
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {b.municipality}
                </span>
              </div>
              {b.address && (
                <p className="text-[11px] text-muted-foreground">
                  {b.address}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Badge
                variant={b.has_delivery ? "default" : "outline"}
                className="cursor-pointer flex items-center gap-1 px-2 py-0 h-5 text-[10px]"
                onClick={() => onToggleDelivery(b.id, b.has_delivery)}
              >
                <Truck className="h-3 w-3" />
                {b.has_delivery ? "Con envío" : "Envío sin info"}
              </Badge>
              <div className="flex gap-1 justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(b)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDelete(b.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
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

          <div className="mt-2 flex flex-wrap gap-1">
            {b.tags && b.tags.length > 0 ? (
              <>
                {b.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] flex items-center gap-1"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                {b.tags.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{b.tags.length - 4}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                Sin tags
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
