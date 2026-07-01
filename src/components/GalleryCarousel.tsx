"use client";

import { useEffect, useState } from "react";
import GalleryPeekStrip from "./GalleryPeekStrip";
import GalleryScrollRow from "./GalleryScrollRow";

export type GalleryImage = { src: string; alt: string };

// By Day / By Night gallery wrapper. Duplicates the 3 designed images to 6 and renders exactly
// one child so only its effects run: the pinned scroll row on desktop when motion is allowed,
// otherwise the peek-strip carousel (mobile, and the reduced-motion desktop fallback).
export default function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  const sextet = [...images, ...images];

  // false during SSR / first paint (→ peek strip), so server and client first render match.
  const [useScrollRow, setUseScrollRow] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 796px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setUseScrollRow(desktop.matches && !reduce.matches);
    update();
    desktop.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return useScrollRow ? (
    <GalleryScrollRow images={sextet} />
  ) : (
    <GalleryPeekStrip images={sextet} />
  );
}
