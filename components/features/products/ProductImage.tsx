import Image from "next/image";

export function ProductImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return <div className={`image-soft flex items-center justify-center text-sm font-semibold text-cream ${className}`}>Imagen artesanal</div>;
  }

  return <Image src={src} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" className={`object-cover ${className}`} />;
}
