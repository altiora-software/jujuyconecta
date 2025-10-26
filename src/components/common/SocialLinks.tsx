// src/components/common/SocialLinks.tsx
import { Facebook, Instagram, Twitter, Youtube, Mail, Globe } from "lucide-react";

type Item = {
  href: string;
  label: string; // ej: "Instagram"
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Props = {
  items: Item[];
  className?: string;
  rounded?: "lg" | "xl" | "2xl"; // opcional: tamaño del pill
};

export default function SocialLinks({ items, className = "", rounded = "xl" }: Props) {
  const r =
    rounded === "2xl"
      ? "rounded-2xl"
      : rounded === "lg"
      ? "rounded-lg"
      : "rounded-xl";

  return (
    <nav
      aria-label="Redes sociales"
      className={`w-full flex justify-center ${className}`}
    >
      <ul className="flex flex-wrap justify-center items-center gap-3 max-w-full">
        {items.map(({ href, label, icon: Icon }, i) => (
          <li key={i} className="flex justify-center">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className={`
                flex items-center gap-2 px-4 py-2
                bg-gradient-to-r from-green-400 via-green-500 to-green-600
                text-white font-medium shadow-md
                ${r}
                transform transition duration-300 hover:scale-105 hover:shadow-xl
                backdrop-blur-sm border border-white/20
                text-sm md:text-base
                justify-center
              `}
            >
              {Icon ? (
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Globe className="h-5 w-5 md:h-6 md:w-6" />
              )}
              <span className="hidden md:inline">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const Icons = { Facebook, Instagram, Twitter, Youtube, Mail, Globe };
