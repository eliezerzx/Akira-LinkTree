import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

interface LinkButtonProps {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  size?: Size;
}

// Botao de link (icone + titulo + subtitulo), no estilo pedido
// (icon/title/subtitle/size), com o tema roxo/preto do Akira.
export function LinkButton({ href, icon, title, subtitle, size = "md" }: LinkButtonProps) {
  return (
    <a href={href} target="_blank" rel="noopener" className={`icon-link icon-link--${size}`}>
      <span className="icon-link-icon">{icon}</span>
      <span className="icon-link-text">
        <span className="icon-link-title">{title}</span>
        {subtitle && <span className="icon-link-subtitle">{subtitle}</span>}
      </span>
    </a>
  );
}
