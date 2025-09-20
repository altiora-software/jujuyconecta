import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Msg = { sender: "user" | "bot"; text: string; booking_url?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  showWelcome?: boolean;
  title?: string;
};

const ASSISTANT_ENDPOINT =
  import.meta.env.VITE_ASSISTANT_PROXY || import.meta.env.VITE_N8N_WEBHOOK_URL;

export default function JujuyConectaAssistantModal({
  open,
  onClose,
  showWelcome = true,
  title = "Asistente • Jujuy Conecta",
}: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorBar, setErrorBar] = useState("");
  const sessionIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ID de sesión (persistente)
  useEffect(() => {
    let sid = localStorage.getItem("jc_chat_sid");
    if (!sid) {
      sid = crypto?.randomUUID?.() || String(Date.now());
      localStorage.setItem("jc_chat_sid", sid);
    }
    sessionIdRef.current = sid;
  }, []);

  // Lock scroll + cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.documentElement.style.overflow = prev || "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  // Bienvenida
  useEffect(() => {
    if (!open || !showWelcome) return;
    setMessages((m) =>
      m.length
        ? m
        : [
            {
              sender: "bot",
              text:
                "¡Hola! Soy el asistente de **Jujuy Conecta** 🤖. Te ayudo a encontrar información sobre colectivos, recursos sociales, empleos y seguridad digital en Jujuy.",
            },
          ]
    );
  }, [open, showWelcome]);

  // Autoscroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Autosize: textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 20 * 5; // ~5 líneas
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [input, open]);

  if (!open) return null;

  // === RAG local simple con Supabase (muestra corta) ===
  async function buildLocalContext(query: string): Promise<string> {
    const q = query.toLowerCase();
    let parts: string[] = [];

    try {
      // Transporte
      if (/colectivo|línea|linea|transporte|bondi/.test(q)) {
        const { data } = await supabase
          .from("transport_lines")
          .select("number,name,active")
          .order("number", { ascending: true })
          .limit(6);
        if (data?.length) {
          parts.push(
            `Líneas (muestra): ${data
              .map((l: any) => `L${l.number} ${l.name} (${l.active ? "activa" : "inactiva"})`)
              .join(" | ")}`
          );
        }
      }

      // Recursos sociales
      if (/merendero|comedor|recurso|ayuda|social/.test(q)) {
        const { data } = await supabase
          .from("social_resources")
          .select("name,type,address,verified")
          .eq("active", true)
          .order("verified", { ascending: false })
          .limit(6);
        if (data?.length) {
          parts.push(
            `Recursos (muestra): ${data
              .map((r: any) => `${r.name} [${r.type}] - ${r.address}${r.verified ? " ✓" : ""}`)
              .join(" | ")}`
          );
        }
      }

      // Empleos
      if (/empleo|trabajo|laburo|oferta/.test(q)) {
        const { data } = await supabase
          .from("jobs")
          .select("title,location,type")
          .eq("active", true)
          .order("featured", { ascending: false })
          .limit(6);
        if (data?.length) {
          parts.push(
            `Empleos (muestra): ${data
              .map((j: any) => `${j.title} — ${j.location} (${j.type})`)
              .join(" | ")}`
          );
        }
      }

      // Seguridad
      if (/estafa|phishing|grooming|fraude|seguridad/.test(q)) {
        const { data } = await supabase
          .from("security_alerts")
          .select("title,category,severity")
          .eq("active", true)
          .order("featured", { ascending: false })
          .limit(6);
        if (data?.length) {
          parts.push(
            `Alertas (muestra): ${data
              .map((a: any) => `${a.category}/${a.severity}: ${a.title}`)
              .join(" | ")}`
          );
        }
      }
    } catch (e) {
      console.warn("Error generando contexto local:", e);
    }

    return parts.join("\n");
  }

  async function sendToAssistant(payload: {
    message: string;
    context: string;
  }): Promise<{ reply?: string; booking_url?: string }> {
    
    const ENDPOINT = import.meta.env.VITE_ASSISTANT_ENDPOINT
    
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
    })

    const data = await res.json();
    
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);
    setErrorBar("");

    try {
      const localCtx = await buildLocalContext(text);
      const lastUserMsg = messages[messages.length - 1]?.text || "";
      const context = [lastUserMsg, localCtx].filter(Boolean).join("\n---\n");

      const data = await sendToAssistant({ message: text, context });

      const reply =
        data?.reply ||
        "No pude procesarlo ahora mismo. Si querés, dejá tu contacto y te respondemos a la brevedad.";
      setMessages((m) => [...m, { sender: "bot", text: reply, booking_url: data?.booking_url }]);
    } catch (e: any) {
      console.error(e);
      setErrorBar("No pude conectar con el asistente. Revisá el endpoint o el proxy.");
      setMessages((m) => [
        ...m,
        { sender: "bot", text: "Tuvimos un inconveniente procesando tu consulta. Probá nuevamente." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center dark"
      style={{ colorScheme: "dark" }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel principal */}
      <div className="relative w-[94vw] max-w-3xl h-[86dvh] sm:h-[78vh] rounded-2xl overflow-hidden
                      shadow-[0_30px_100px_rgba(0,0,0,0.55)] border border-white/10
                      bg-neutral-950/90 text-neutral-100 flex flex-col">
        {/* Header brand Jujuy Conecta (usa tus colores Tailwind) */}
        <div className="flex items-center justify-between px-5 py-3 text-white bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 grid place-items-center">🧭</div>
            <div>
              <div className="font-semibold leading-none">{title}</div>
              <div className="text-xs opacity-90">Asistencia ciudadana — Jujuy Conecta</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/15 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {errorBar && (
          <div className="px-4 py-2 text-xs bg-red-900/30 text-red-200 border-b border-red-800/40">
            {errorBar}
          </div>
        )}

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <Bubble key={i} side={m.sender === "user" ? "right" : "left"} booking_url={m.booking_url}>
              {m.text}
            </Bubble>
          ))}
          {isTyping && (
            <Bubble side="left" raw>
              <TypingDots />
            </Bubble>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 left-0 right-0">
          <div className="h-4 bg-gradient-to-t from-neutral-950/95 to-transparent" />
          <div className="px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/90 backdrop-blur p-2 shadow">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Preguntá por colectivos, recursos, empleos o alertas…"
                  className="flex-1 min-h-[40px] max-h-32 resize-none bg-transparent outline-none px-2 py-2 text-sm leading-5
                             text-neutral-100 placeholder:text-neutral-400 caret-white"
                />
                <button
                  onClick={handleSend}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                             bg-primary text-white hover:opacity-90 transition shadow"
                  aria-label="Enviar"
                >
                  Enviar
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="px-2 pt-1">
                <span className="text-[11px] text-neutral-400">Enter envía • Shift+Enter hace salto de línea</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== util: linkea URLs ===== */
function autolink(text: any) {
  if (typeof text !== "string") return text;
  const urlRegex = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (!part) return null;
    const isUrl = /^(https?:\/\/|www\.)/i.test(part);
    if (!isUrl) return <span key={i}>{part}</span>;
    const href = part.startsWith("http") ? part : `https://${part}`;
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-400 hover:text-blue-300 break-all"
      >
        {part}
      </a>
    );
  });
}

function Bubble({
  side = "left",
  children,
  booking_url,
  raw = false,
}: {
  side?: "left" | "right";
  children: any;
  booking_url?: string;
  raw?: boolean;
}) {
  const isRight = side === "right";
  const hasLink = typeof booking_url === "string" && booking_url.startsWith("http");
  const content = raw ? children : typeof children === "string" ? autolink(children) : children;

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm space-y-2
        ${isRight ? "bg-primary text-white" : "bg-neutral-800 border border-neutral-700/60 text-neutral-100"}`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {hasLink && (
          <a
            href={booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-secondary text-white hover:opacity-90 transition"
            role="button"
          >
            Abrir agenda
          </a>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <i className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.2s]" />
      <i className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.1s]" />
      <i className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
    </span>
  );
}
