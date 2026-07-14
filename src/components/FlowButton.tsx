interface FlowButtonProps {
  href: string;
  text: string;
}

// Botao "Flow" (seta + circulo que preenche no hover), portado do template
// (Tailwind arbitrary values) para CSS puro, recolorido em roxo (tema Akira).
export function FlowButton({ href, text }: FlowButtonProps) {
  return (
    <a href={href} target="_blank" rel="noopener" className="flow-btn">
      <ArrowIcon className="flow-btn-arrow flow-btn-arrow-left" />
      <span className="flow-btn-label">{text}</span>
      <span className="flow-btn-circle" />
      <ArrowIcon className="flow-btn-arrow flow-btn-arrow-right" />
    </a>
  );
}

function ArrowIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
