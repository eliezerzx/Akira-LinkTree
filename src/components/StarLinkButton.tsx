interface StarLinkButtonProps {
  href: string;
  label: string;
}

// Botao com "estrelinhas" que explodem no hover, portado do template
// (Tailwind arbitrary values) para CSS puro, recolorido em roxo (tema Akira).
export function StarLinkButton({ href, label }: StarLinkButtonProps) {
  return (
    <a href={href} target="_blank" rel="noopener" className="star-btn">
      <span className="star-btn-label">{label}</span>
      <span className="star star-1">
        <Star />
      </span>
      <span className="star star-2">
        <Star />
      </span>
      <span className="star star-3">
        <Star />
      </span>
      <span className="star star-4">
        <Star />
      </span>
      <span className="star star-5">
        <Star />
      </span>
      <span className="star star-6">
        <Star />
      </span>
    </a>
  );
}

function Star() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="star-svg">
      <path d="M392.05 0c-20.9,210.08-184.06,378.41-392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93-210.06 184.09-378.37 392.05-407.74-207.98-29.38-371.16-197.69-392.06-407.78z" />
    </svg>
  );
}
