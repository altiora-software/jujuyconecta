// src/pages/Notifications.tsx
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { registerPushSubscription } from "@/lib/pushClient";

// tipos locales, no dependas del archivo de api
export type NotificationChannelKey =
  | "portal_noticias"
  | "agenda_comunitaria"
  | "marketplace_local"
  | "alertas_seguridad"
  | "cursos_talleres"
  | "mapa_turistico"
  | "rutas_recorridos"
  | "eventos_turisticos"
  | "recursos_sociales"
  | "transporte_mapas"
  | "bolsa_trabajo_local";

  export interface NotificationPreferences {
    id?: string;
    user_id: string;
  
    global_enabled: boolean;
  
    portal_noticias: boolean;
    agenda_comunitaria: boolean;
    marketplace_local: boolean;
    alertas_seguridad: boolean;
    cursos_talleres: boolean;
    mapa_turistico: boolean;
    rutas_recorridos: boolean;
    eventos_turisticos: boolean;
    recursos_sociales: boolean;
    transporte_mapas: boolean;
    bolsa_trabajo_local: boolean;
  
    accepted_notifications: boolean;        // <── AGREGAR
    permission_granted_at?: string | null;  // <── AGREGAR
  
    created_at?: string;
    updated_at?: string;
  }

type NotificationPreferencesBody = Partial<NotificationPreferences> & {
  enableAll?: boolean;
};

const CHANNEL_LABELS: { key: NotificationChannelKey; title: string; description: string }[] = [
  {
    key: "portal_noticias",
    title: "Portal de Noticias",
    description: "Novedades importantes y noticias destacadas.",
  },
  {
    key: "agenda_comunitaria",
    title: "Agenda Comunitaria",
    description: "Actividades, reuniones y eventos barriales.",
  },
  {
    key: "marketplace_local",
    title: "Marketplace Local",
    description: "Nuevos emprendedores y promociones relevantes.",
  },
  {
    key: "alertas_seguridad",
    title: "Alertas de Seguridad",
    description: "Avisos de incidentes relevantes para tu zona.",
  },
  {
    key: "cursos_talleres",
    title: "Cursos y Talleres",
    description: "Formaciones gratuitas o de interés general.",
  },
  {
    key: "mapa_turistico",
    title: "Mapa Turístico",
    description: "Nuevos puntos de interés y recomendaciones.",
  },
  {
    key: "rutas_recorridos",
    title: "Rutas y Recorridos",
    description: "Cambios o mejoras en circuitos y recorridos.",
  },
  // {
  //   key: "eventos_turisticos",
  //   title: "Eventos Turísticos",
  //   description: "Fiestas, festivales y actividades para visitar.",
  // },
  {
    key: "recursos_sociales",
    title: "Recursos Sociales",
    description: "Programas de ayuda, acompañamiento y servicios.",
  },
  {
    key: "transporte_mapas",
    title: "Transporte y Mapas",
    description: "Cambios de recorridos, paradas y horarios.",
  },
  {
    key: "bolsa_trabajo_local",
    title: "Bolsa de trabajo local",
    description: "Nuevas ofertas laborales verificadas.",
  },
];

const API_URL = "/api/notifications";

// helper para no repetir lógica de token
// async function getAccessTokenOrThrow() {
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   if (error || !session) {
//     console.error("No Supabase session found", error);
//     throw new Error("No hay sesión de usuario");
//   }

//   return session.access_token;
// }

async function apiGetPreferences(): Promise<NotificationPreferences | null> {
  // const token = await getAccessTokenOrThrow();

  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
     },
  });

  if (!res.ok) {
    console.error("Error fetching notification preferences", await res.text());
    return null;
  }

  const json = await res.json();
  return json.preferences as NotificationPreferences;
}

async function apiSavePreferences(body: NotificationPreferencesBody): Promise<NotificationPreferences | null> {
  // const token = await getAccessTokenOrThrow();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Error saving notification preferences", await res.text());
    return null;
  }

  const json = await res.json();
  return json.preferences as NotificationPreferences;
}

async function apiEnableAllNotifications(): Promise<NotificationPreferences | null> {
  return apiSavePreferences({ enableAll: true });
}

async function apiUpdateChannel(
  key: NotificationChannelKey,
  value: boolean
): Promise<NotificationPreferences | null> {
  return apiSavePreferences({ [key]: value } as NotificationPreferencesBody);
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { permission, isSupported, requestPermission, sendTestNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  // cargar preferencias al montar
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await apiGetPreferences();
        if (mounted) {
          setPrefs(data);
        }
      } catch (err) {
        console.error("Error loading notification preferences", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRequestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Tu navegador no soporta notificaciones",
        description: "Probá desde otro navegador o actualizá tu versión.",
        variant: "destructive",
      });
      return;
    }
  
    const result = await requestPermission();
  
    if (result === "granted") {
      toast({
        title: "Notificaciones activadas",
        description: "Vamos a habilitar todos los módulos por defecto.",
      });
  
      try {
        setSaving(true);
  
        // 1) habilitar todo + marcar aceptación
        const now = new Date().toISOString();
        const updated = await apiSavePreferences({
          enableAll: true,
          accepted_notifications: true,
          permission_granted_at: now,
        });
  
        if (updated) {
          setPrefs(updated);
        }
  
        // 2) registrar suscripción push
        await registerPushSubscription();
  
        // 3) notificación local de prueba (tu hook actual)
        sendTestNotification();
      } catch (err) {
        console.error("Error completing notification setup", err);
        toast({
          title: "Error al configurar las notificaciones",
          description: "Intentá de nuevo en unos segundos.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    } else {
      toast({
        title: "Permiso denegado",
        description:
          "Sin permiso del navegador no podemos enviarte alertas. Podés cambiarlo en la configuración del navegador.",
        variant: "destructive",
      });
    }
  };
  

  const handleToggleGlobal = async (value: boolean) => {
    if (!prefs) return;

    if (permission !== "granted") {
      toast({
        title: "Primero tenés que habilitar el permiso del navegador",
        description: "Tocá en Autorizar notificaciones para continuar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: NotificationPreferencesBody = {
        global_enabled: value,
      };

      // si lo prendes, prendes todo
      if (value) {
        CHANNEL_LABELS.forEach(({ key }) => {
          (payload as any)[key] = true;
        });
      }

      const result = await apiSavePreferences(payload);
      if (result) {
        setPrefs(result);
      }
    } catch (err) {
      console.error("Error updating global notifications", err);
      toast({
        title: "Error al actualizar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChannel = async (key: NotificationChannelKey, value: boolean) => {
    if (!prefs) return;

    if (permission !== "granted") {
      toast({
        title: "Sin permiso del navegador",
        description: "Primero autorizá las notificaciones.",
        variant: "destructive",
      });
      return;
    }

    if (!prefs.global_enabled) {
      toast({
        title: "Notificaciones generales desactivadas",
        description: "Activá primero Activar todas las notificaciones.",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await apiUpdateChannel(key, value);
      if (result) {
        setPrefs(result);
      }
    } catch (err) {
      console.error("Error updating channel", key, err);
      toast({
        title: "Error al actualizar",
        description: "No se pudo guardar este cambio.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Configurar Notificaciones</h1>
          <p className="text-muted-foreground">Cargando tus preferencias…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurar Notificaciones</h1>
          <p className="text-muted-foreground">
            Elegí qué avisos querés recibir desde Jujuy Conecta.
          </p>
        </div>

        {/* estado del navegador */}
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Permiso del navegador</p>
            <p className="text-sm text-muted-foreground">
              {isSupported
                ? permission === "granted"
                  ? "Notificaciones habilitadas."
                  : permission === "denied"
                  ? "Bloqueadas, tenés que habilitarlas desde la configuración del navegador."
                  : "Todavía no pedimos permiso para enviarte notificaciones."
                : "Este navegador no soporta notificaciones."}
            </p>
          </div>
          {isSupported && permission !== "granted" && (
            <Button onClick={handleRequestPermission} disabled={saving}>
              Autorizar notificaciones
            </Button>
          )}
          {isSupported && permission === "granted" && (
            <Button variant="outline" onClick={sendTestNotification} disabled={saving}>
              Enviar notificación de prueba
            </Button>
          )}
        </div>

        {/* master switch */}
        <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Activar todas las notificaciones</p>
            <p className="text-sm text-muted-foreground">
              Al habilitar esta opción, vas a recibir avisos de todos los módulos de Jujuy Conecta.
            </p>
          </div>
          <Switch
            checked={prefs.global_enabled}
            disabled={saving}
            onCheckedChange={handleToggleGlobal}
          />
        </div>

        {/* canales por módulo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHANNEL_LABELS.map(({ key, title, description }) => (
              <div
                key={key}
                className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between"
              >
                <div className="pr-4">
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={(prefs as any)[key] as boolean}
                  disabled={saving || !prefs.global_enabled}
                  onCheckedChange={(value) => handleToggleChannel(key, value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
