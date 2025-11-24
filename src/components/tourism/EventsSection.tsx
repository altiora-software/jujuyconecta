// src/components/tourism/EventsSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { TourismEvent } from "@/components/types/tourism";
import { formatDate } from "./utils";

interface EventsSectionProps {
  events: TourismEvent[];
}

export function EventsSection({ events }: EventsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda de eventos
          </h2>
          <p className="text-sm text-muted-foreground">
            Próximas fiestas, festivales y actividades turísticas en Jujuy.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Por ahora no hay eventos publicados, volvé a revisar más adelante.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm md:text-base">
                      {event.title}
                    </h3>
                    {event.category && (
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.date)}
                    </span>
                    {event.municipality && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.municipality}
                      </span>
                    )}
                    {event.location_detail && (
                      <span>{event.location_detail}</span>
                    )}
                    {event.price_range && (
                      <Badge variant="secondary">
                        {event.price_range}
                      </Badge>
                    )}
                  </div>
                  {event.short_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.short_description}
                    </p>
                  )}
                </div>
                {event.external_link && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 md:mt-0"
                    asChild
                  >
                    <a
                      href={event.external_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver más información
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
