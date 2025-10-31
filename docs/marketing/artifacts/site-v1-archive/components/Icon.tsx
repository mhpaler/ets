// components/Icon.tsx
interface IconProps {
  src: string;
  size?: number;
  alt: string;
}

export default function Icon({ src, size = 24, alt }: IconProps) {
  return <img src={src} alt={alt} width={size} height={size} style={{ verticalAlign: "text-bottom" }} />;
}
