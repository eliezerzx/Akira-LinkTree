import { useEffect, useId, useRef, useState, type MouseEvent } from "react";

interface LinkBadgeProps {
  href: string;
  iconSrc: string;
  label: string;
}

// Fisica de tilt 3D portada 1:1 do template original (matrix3d por posicao do mouse).
const identityMatrix = "1, 0, 0, 0, " + "0, 1, 0, 0, " + "0, 0, 1, 0, " + "0, 0, 0, 1";

const maxRotate = 0.25;
const minRotate = -0.25;
const maxScale = 1;
const minScale = 0.97;

// Tons roxo/rosa/azul (tema Akira) no lugar do arco-iris do badge original.
const hues = [275, 260, 300, 320, 235, 285, 250];

export function LinkBadge({ href, iconSrc, label }: LinkBadgeProps) {
  const uid = useId();
  const ref = useRef<HTMLAnchorElement>(null);
  const [firstOverlayPosition, setFirstOverlayPosition] = useState(0);
  const [matrix, setMatrix] = useState(identityMatrix);
  const [currentMatrix, setCurrentMatrix] = useState(identityMatrix);
  const [disableInOutOverlayAnimation, setDisableInOutOverlayAnimation] = useState(true);
  const [disableOverlayAnimation, setDisableOverlayAnimation] = useState(false);
  const [isTimeoutFinished, setIsTimeoutFinished] = useState(false);

  const enterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeout1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeout2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeout3 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDimensions = () => {
    const rect = ref.current?.getBoundingClientRect();
    return {
      left: rect?.left || 0,
      right: rect?.right || 0,
      top: rect?.top || 0,
      bottom: rect?.bottom || 0,
    };
  };

  const getMatrix = (clientX: number, clientY: number) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;
    const scale = [
      maxScale - ((maxScale - minScale) * Math.abs(xCenter - clientX)) / (xCenter - left),
      maxScale - ((maxScale - minScale) * Math.abs(yCenter - clientY)) / (yCenter - top),
      maxScale -
        ((maxScale - minScale) * (Math.abs(xCenter - clientX) + Math.abs(yCenter - clientY))) /
          (xCenter - left + (yCenter - top)),
    ];
    const rotate = {
      x1: 0.25 * ((yCenter - clientY) / yCenter - (xCenter - clientX) / xCenter),
      x2: maxRotate - ((maxRotate - minRotate) * Math.abs(right - clientX)) / (right - left),
      x3: 0,
      y0: 0,
      y2: maxRotate - ((maxRotate - minRotate) * (top - clientY)) / (top - bottom),
      y3: 0,
      z0: -(maxRotate - ((maxRotate - minRotate) * Math.abs(right - clientX)) / (right - left)),
      z1: 0.2 - (0.2 + 0.6) * ((top - clientY) / (top - bottom)),
      z3: 0,
    };
    return (
      `${scale[0]}, ${rotate.y0}, ${rotate.z0}, 0, ` +
      `${rotate.x1}, ${scale[1]}, ${rotate.z1}, 0, ` +
      `${rotate.x2}, ${rotate.y2}, ${scale[2]}, 0, ` +
      `${rotate.x3}, ${rotate.y3}, ${rotate.z3}, 1`
    );
  };

  const getOppositeMatrix = (_matrix: string, clientY: number, onEnter?: boolean) => {
    const { top, bottom } = getDimensions();
    const oppositeY = bottom - clientY + top;
    const weakening = onEnter ? 0.7 : 4;
    const multiplier = onEnter ? -1 : 1;
    return _matrix
      .split(", ")
      .map((item, index) => {
        if (index === 2 || index === 4 || index === 8) {
          return (-parseFloat(item) * multiplier) / weakening;
        } else if (index === 0 || index === 5 || index === 10) {
          return "1";
        } else if (index === 6) {
          return (
            (multiplier * (maxRotate - ((maxRotate - minRotate) * (top - oppositeY)) / (top - bottom))) / weakening
          );
        } else if (index === 9) {
          return (maxRotate - ((maxRotate - minRotate) * (top - oppositeY)) / (top - bottom)) / weakening;
        }
        return item;
      })
      .join(", ");
  };

  const onMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    [leaveTimeout1, leaveTimeout2, leaveTimeout3].forEach((t) => t.current && clearTimeout(t.current));
    setDisableOverlayAnimation(true);
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;
    setDisableInOutOverlayAnimation(false);
    enterTimeout.current = setTimeout(() => setDisableInOutOverlayAnimation(true), 350);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5);
      });
    });
    const m = getMatrix(e.clientX, e.clientY);
    setMatrix(getOppositeMatrix(m, e.clientY, true));
    setIsTimeoutFinished(false);
    setTimeout(() => setIsTimeoutFinished(true), 200);
  };

  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;
    setTimeout(
      () => setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5),
      150
    );
    if (isTimeoutFinished) {
      setCurrentMatrix(getMatrix(e.clientX, e.clientY));
    }
  };

  const onMouseLeave = (e: MouseEvent<HTMLAnchorElement>) => {
    const oppositeMatrix = getOppositeMatrix(matrix, e.clientY);
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    setCurrentMatrix(oppositeMatrix);
    setTimeout(() => setCurrentMatrix(identityMatrix), 200);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDisableInOutOverlayAnimation(false);
        leaveTimeout1.current = setTimeout(() => setFirstOverlayPosition(-firstOverlayPosition / 4), 150);
        leaveTimeout2.current = setTimeout(() => setFirstOverlayPosition(0), 300);
        leaveTimeout3.current = setTimeout(() => {
          setDisableOverlayAnimation(false);
          setDisableInOutOverlayAnimation(true);
        }, 500);
      });
    });
  };

  useEffect(() => {
    if (isTimeoutFinished) setMatrix(currentMatrix);
  }, [currentMatrix, isTimeoutFinished]);

  const overlayAnimations = hues
    .map(
      (_, i) => `
      @keyframes linkOverlay-${uid}-${i} {
        0% { transform: rotate(${i * 12}deg); }
        50% { transform: rotate(${(i + 1) * 12}deg); }
        100% { transform: rotate(${i * 12}deg); }
      }
    `
    )
    .join(" ");

  const maskId = `mask-${uid}`;
  const blurId = `blur-${uid}`;

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener"
      className="link-badge"
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <style>{overlayAnimations}</style>
      <div
        className="link-badge-tilt"
        style={{
          transform: `perspective(700px) matrix3d(${matrix})`,
          transition: "transform 200ms ease-out",
        }}
      >
        <svg viewBox="0 0 400 64" className="link-badge-svg" preserveAspectRatio="none">
          <defs>
            <filter id={blurId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            </filter>
            <mask id={maskId}>
              <rect width="400" height="64" rx="16" fill="white" />
            </mask>
          </defs>
          <rect width="400" height="64" rx="16" className="link-badge-bg" />
          <rect x="2.5" y="2.5" width="395" height="59" rx="13.5" className="link-badge-border" />
          <g mask={`url(#${maskId})`} style={{ mixBlendMode: "color-dodge" }}>
            {hues.map((hue, i) => (
              <g
                key={i}
                style={{
                  transform: `rotate(${firstOverlayPosition + i * 12}deg)`,
                  transformOrigin: "center center",
                  transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
                  animation: disableOverlayAnimation ? "none" : `linkOverlay-${uid}-${i} 6s infinite`,
                  willChange: "transform",
                }}
              >
                <polygon
                  points="0,0 400,64 400,0 0,64"
                  fill={`hsl(${hue}, 85%, 65%)`}
                  filter={`url(#${blurId})`}
                  opacity="0.45"
                />
              </g>
            ))}
          </g>
        </svg>
        <span className="link-badge-content">
          <img className="link-badge-icon" src={iconSrc} alt="" />
          {label}
        </span>
      </div>
    </a>
  );
}
