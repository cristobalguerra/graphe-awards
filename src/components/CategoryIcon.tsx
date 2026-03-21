interface Props {
  icon: string;
  color: string;
  size?: number;
}

export default function CategoryIcon({ icon, color, size = 80 }: Props) {
  const s = size;
  const half = s / 2;

  switch (icon) {
    case "circle":
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half * 0.9} fill={color} />
        </svg>
      );
    case "shield":
      return (
        <svg width={s} height={s} viewBox="0 0 80 80">
          <path
            d="M10 15 Q10 5 20 5 L60 5 Q70 5 70 15 L70 50 Q70 70 40 78 Q10 70 10 50 Z"
            fill={color}
          />
        </svg>
      );
    case "logo":
      return (
        <svg width={s} height={s} viewBox="0 0 80 80">
          <rect x="5" y="10" width="30" height="60" rx="15" fill={color} />
          <rect x="40" y="10" width="35" height="60" rx="5" fill={color} />
        </svg>
      );
    case "square":
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x="4" y="4" width={s - 8} height={s - 8} rx="4" fill={color} />
        </svg>
      );
    case "arch":
      return (
        <svg width={s} height={s} viewBox="0 0 80 80">
          <path
            d="M5 75 L5 40 Q5 5 40 5 Q75 5 75 40 L75 75 Z"
            fill={color}
          />
        </svg>
      );
    case "pentagon":
      return (
        <svg width={s} height={s} viewBox="0 0 80 80">
          <path
            d="M10 30 Q10 5 40 5 Q70 5 70 30 L70 55 Q70 75 50 75 L30 75 Q10 75 10 55 Z"
            fill={color}
          />
        </svg>
      );
    case "dots":
      return (
        <svg width={s} height={s} viewBox="0 0 80 80">
          <circle cx="25" cy="25" r="15" fill={color} />
          <circle cx="55" cy="25" r="15" fill={color} />
          <circle cx="25" cy="55" r="15" fill={color} />
          <circle cx="55" cy="55" r="15" fill={color} />
        </svg>
      );
    case "flower":
      return (
        <svg width={s} height={s} viewBox="0 0 80 80">
          <ellipse cx="40" cy="20" rx="10" ry="18" fill={color} transform="rotate(0 40 40)" />
          <ellipse cx="40" cy="20" rx="10" ry="18" fill={color} transform="rotate(90 40 40)" />
          <ellipse cx="40" cy="20" rx="10" ry="18" fill={color} transform="rotate(45 40 40)" />
          <ellipse cx="40" cy="20" rx="10" ry="18" fill={color} transform="rotate(-45 40 40)" />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half * 0.9} fill={color} />
        </svg>
      );
  }
}
