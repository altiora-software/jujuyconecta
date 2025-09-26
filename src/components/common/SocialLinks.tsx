// src/components/common/SocialLinks.tsx
import { Facebook, Instagram, Twitter, Youtube, Mail, Globe } from "lucide-react";

type Item = {
  href: string;
  label: string;            // ej: "Instagram"
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Props = {
  items: Item[];
  className?: string;
  rounded?: "lg" | "xl" | "2xl"; // opcional: tamaño del pill
};

export default function SocialLinks({ items, className = "", rounded = "xl" }: Props) {
  const r = rounded === "2xl" ? "rounded-2xl" : rounded === "lg" ? "rounded-lg" : "rounded-xl";

  return (
    <nav
      aria-label="Redes sociales"
      className={`w-full ${className}`}
    >
      <ul className="flex flex-wrap items-center gap-2">
        {items.map(({ href, label, icon: Icon }, i) => (
          <li key={i}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className={[
                "inline-flex items-center gap-2 px-3 py-2",
                "bg-card/70 backdrop-blur border border-white/10",
                "hover:bg-card/90 transition-smooth shadow-sm card-gradient",
                r,
                "text-sm"
              ].join(" ")}
            >
              {/* Ícono */}
              {Icon ? (
                <Icon className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {/* Etiqueta solo en >= md */}
              <span className="hidden md:inline">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Exportá íconos por defecto si querés usarlos rápido:
export const Icons = { Facebook, Instagram, Twitter, Youtube, Mail, Globe };
