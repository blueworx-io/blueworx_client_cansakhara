"use client";

import GalleryPeekStrip from "./GalleryPeekStrip";

export type GalleryImage = { src: string; alt: string };

// Wrapper for the By Day / By Night gallery. For now it renders the existing peek-strip
// carousel over a 6-image set; the next task adds the desktop scroll-driven row.
export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  // Duplicate the 3 designed images to 6 ([1,2,3,1,2,3]) so the desktop scroll effect
  // (added next) has real horizontal travel; no two identical slides sit adjacent.
  const sextet = [...images, ...images];
  return <GalleryPeekStrip images={sextet} />;
}
