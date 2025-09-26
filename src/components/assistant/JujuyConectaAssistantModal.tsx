import { getCorrelator } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useCorrelator } from "@/hooks/useCorrelator";

// ⬇️ Solo enviamos el MENSAJE al agente (sin contexto adicional)
// y validamos máximo 12 palabras por mensaje.

type Msg = { sender: "user" | "bot"; text: string; booking_url?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  showWelcome?: boolean;
  title?: string;
};

const ASSISTANT_ENDPOINT = import.meta.env.VITE_ASSISTANT_ENDPOINT;

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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const { correlator, rotateCorrelator } = useCorrelator();

  // === Helpers ===
  const normalize = (s: string) => s.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = (s: string) => (normalize(s) ? normalize(s).split(" ").length : 0);
  const MAX_WORDS = 12;

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

  const startNewSession = () => {
    const newCorr = rotateCorrelator();
    console.log("Nueva sesión. Correlator:", newCorr);
    };
  // Bienvenida (opcional)
  useEffect(() => {
    if (!open || !showWelcome) return;
    setMessages((m) =>
      m.length
        ? m
        : [
            {
              sender: "bot",
              text:
                "Escribí tu consulta en tus palabras y charlá con el asistente de **Jujuy Conecta** 🤖.",
            },
          ]
    );
    startNewSession();
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


  // === Llamada: solo mensaje ===
  async function sendToAssistant(message: string): Promise<{ reply?: string; booking_url?: string }> {
    // if (!ASSISTANT_ENDPOINT) throw new Error("ASSISTANT_ENDPOINT no configurado");
    const objetoAEnviar = {
        message,

    }
    const res = await fetch(ASSISTANT_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Correlation-Id": getCorrelator()
    },
      body: JSON.stringify(message),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errTxt = typeof data === "object" && data && "error" in data ? (data as any).error : "";
      throw new Error(errTxt || `HTTP ${res.status}`);
    }
    return data;
  }

  async function handleSend() {
    const text = normalize(input);
    if (!text) return;

    const wc = wordCount(text);
    if (wc > MAX_WORDS) {
      setErrorBar(`Máximo ${MAX_WORDS} palabras por mensaje. Tenés ${wc}.`);
      return;
    }

    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);
    setErrorBar("");

    try {
      const data = await sendToAssistant(text);
      const reply = data?.reply ||
        "No pude procesarlo ahora mismo. Probá de nuevo en un rato.";
      setMessages((m) => [...m, { sender: "bot", text: reply, booking_url: data?.booking_url }]);
    } catch (e) {
      console.error(e);
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

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const raw = e.target.value;
    const norm = normalize(raw);
    const words = norm ? norm.split(" ") : [];

    if (words.length > MAX_WORDS) {
      // Recortamos a 12 palabras y avisamos
      const trimmed = words.slice(0, MAX_WORDS).join(" ");
      setInput(trimmed);
      setErrorBar(`Máximo ${MAX_WORDS} palabras por mensaje.`);
      return;
    }

    setErrorBar("");
    setInput(raw); // mantenemos el valor con espacios mientras no exceda
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
        {/* Header brand Jujuy Conecta */}
        <header className="relative overflow-hidden border-b border-white/10">
          {/* franja sutil en gradiente */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-sky-500/20" />
          <div className="relative flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* LOGO circular con aro de luz */}
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-300 shadow-glow" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-7 w-7 rounded-full bg-neutral-950/85 border border-white/20 grid place-items-center">
                    <span className="text-[10px] font-bold tracking-wider text-white">JC</span>
                  </div>
                </div>
              </div>
              {/* Títulos */}
              <div className="min-w-0">
                <h2 className="font-semibold leading-none text-white truncate">{title}</h2>
                <p className="text-[11px] text-white/80">Asistencia ciudadana • Jujuy Conecta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full grid place-items-center bg-white/5 hover:bg-white/10 border border-white/15 transition"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </header>


        {errorBar && (
          <div className="px-4 py-2 text-[12px] bg-red-900/35 text-red-200 border-b border-red-800/40">
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
              {/* Instrucciones + contador */}
              <div className="px-2 pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-[11px] text-neutral-400">
                  Enter envía • Shift+Enter hace salto de línea
                </span>
                <span className="text-[11px] text-neutral-500">
                  {wordCount(input)}/{MAX_WORDS} palabras
                </span>
              </div>

              {/* Barra de entrada */}
              <div className="mt-1 flex items-end gap-2">
                <div className="flex-1 relative">
                  {/* icono de guía */}
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    💬
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Escribí tu consulta…"
                    className="w-full min-h-[44px] max-h-32 resize-none
                              bg-neutral-800/60 border border-white/10 rounded-xl
                              pl-9 pr-3 py-2 text-sm leading-5 text-neutral-100
                              placeholder:text-neutral-400 caret-white
                              focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-white/20 transition"
                  />
                </div>

                {/* CTA enviar: pill con gradiente y glow */}
                <button
                  onClick={handleSend}
                  className="shrink-0 inline-flex items-center justify-center gap-2
                            px-4 h-11 rounded-xl
                            bg-gradient-to-br from-emerald-500 to-teal-500
                            text-white hover:opacity-95 transition shadow-glow"
                  aria-label="Enviar"
                >
                  Enviar
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Disclaimer breve (4 palabras) + aclaración */}
              <div className="px-2 pt-2">
                <p className="text-[10px] text-neutral-500">
                  El asistente es informativo y puede no ser exacto. Consultá siempre fuentes oficiales.
                </p>
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
        ${isRight
          ? "bg-gradient-to-br from-emerald-500/90 to-teal-500/90 text-white"
          : "bg-neutral-800/80 border border-neutral-700/60 text-neutral-100 backdrop-blur"}`
        }
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {hasLink && (
          <a
            href={booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-2 rounded-lg
                      bg-white/10 hover:bg-white/15 text-white transition"
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
