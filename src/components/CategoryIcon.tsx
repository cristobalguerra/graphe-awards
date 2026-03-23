import { basePath } from "@/lib/basePath";

interface Props {
  icon: string;
  color: string;
  size?: number;
  white?: boolean;
}

const ICON_MAP: Record<string, string> = {
  circle: "fotografia",
  shield: "ilustracion",
  logo: "logotipo",
  square: "producto",
  arch: "empaque",
  pentagon: "editorial",
  dots: "digital",
  flower: "agencia",
  // Direct category IDs
  fotografia: "fotografia",
  ilustracion: "ilustracion",
  logotipo: "logotipo",
  producto: "producto",
  empaque: "empaque",
  editorial: "editorial",
  digital: "digital",
  agencia: "agencia",
};

export default function CategoryIcon({ icon, size = 80, white = false }: Props) {
  const file = ICON_MAP[icon] || icon;
  return (
    <img
      src={`${basePath}/icons/${file}.svg`}
      alt={file}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        filter: white ? "brightness(0) invert(1)" : undefined,
      }}
    />
  );
}
