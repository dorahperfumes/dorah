import Image from "next/image";

export function BottleIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ad8a3f" strokeWidth={1.4}>
      <rect x="40" y="18" width="20" height="10" rx="2" />
      <rect x="44" y="10" width="12" height="9" rx="1.5" />
      <path d="M35 32 Q35 28 40 28 H60 Q65 28 65 32 V78 Q65 84 58 84 H42 Q35 84 35 78 Z" />
      <line x1="35" y1="46" x2="65" y2="46" />
      <path d="M45 60 L50 55 L55 60 L50 65 Z" />
    </svg>
  );
}

export function RingIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ad8a3f" strokeWidth={1.4}>
      <circle cx="50" cy="60" r="20" />
      <path d="M42 42 L50 26 L58 42 Z" />
      <line x1="44" y1="42" x2="56" y2="42" />
    </svg>
  );
}

export function PlaceholderPhoto({
  icon,
  images,
  alt,
}: {
  icon: React.ReactNode;
  images?: string[] | null;
  alt?: string;
}) {
  if (images && images.length > 0) {
    return (
      <div className="card-photo has-image">
        <Image
          src={images[0]}
          alt={alt || ""}
          fill
          sizes="(max-width: 560px) calc(50vw - 28px), (max-width: 900px) 33vw, 260px"
          style={{ objectFit: "contain", padding: "6px" }}
        />
        {images.length > 1 && <span className="photo-count">1/{images.length}</span>}
      </div>
    );
  }
  return (
    <div className="card-photo">
      {icon}
      <span className="ph-tag">Foto a cargar</span>
    </div>
  );
}
