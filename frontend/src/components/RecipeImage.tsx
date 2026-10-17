import type { SyntheticEvent } from "react";

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1557687790-902ede7ab58c?q=80&w=796&auto=format&fit=crop";

function fallbackToPlaceholder(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset.fallback === "1") return;
  img.dataset.fallback = "1";
  img.src = PLACEHOLDER_IMAGE;
}

type Props = {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

function RecipeImage({ src, alt, width, height, className }: Props) {
  return (
    <img
      src={src ? `${src}&w=${width}&h=${height}&fit=crop` : PLACEHOLDER_IMAGE}
      alt={alt}
      className={className}
      onError={fallbackToPlaceholder}
    />
  );
}

export default RecipeImage;
