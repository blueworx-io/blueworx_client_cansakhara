import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GalleryCarousel from "@/components/GalleryCarousel";

export const metadata: Metadata = {
  title: "Can Sakhara | By Night",
  description:
    "As the sun sets over the island, Can Sakhara comes alive in the glow of the afterhours — a warm and cinematic retreat for nights to remember.",
};

const galleryImages = [
  { src: "/images/bynight-gallery-1.png", alt: "Candlelit dinner table at Can Sakhara" },
  { src: "/images/bynight-gallery-2.png", alt: "The illuminated pool and terraces at night" },
  { src: "/images/bynight-gallery-3.png", alt: "A DJ at the decks during an evening gathering" },
];

// The bordered "Secondary Button" (label only) from the design system.
// Mobile 10px/4px tracking, desktop 14px/5.6px.
function SecondaryButton({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center whitespace-nowrap border border-white px-4 py-[10px] font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[4px] text-white transition-colors hover:bg-white hover:text-[#031927] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:px-8 md:py-4 md:text-[14px] md:tracking-[5.6px] ${className}`}
    >
      <span>{children}</span>
    </a>
  );
}

export default function ByNight() {
  return (
    <main className="site-shell h-screen overflow-x-hidden overflow-y-auto bg-[#000e16] text-white">
      {/* Hero — flat By Night navy, transparent navbar over it */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center bg-[#031927]">
        <SiteHeader theme="night" />

        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[118px] mx-auto h-px w-[362px] bg-white md:top-[131px] md:w-[1280px]"
        />

        <div className="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[60px]">
          <Image
            src="/images/moon.svg"
            alt=""
            width={110}
            height={110}
            className="size-20 md:size-[110px]"
          />
          <h1 className="font-display text-[34px] font-light uppercase leading-[1.4] tracking-[17px] text-white indent-[17px] md:text-[56px] md:tracking-[28px] md:indent-[28px]">
            By Night
          </h1>
          <Image
            src="/images/hero-wordmark.svg"
            alt="Can Sakhara"
            width={262}
            height={20}
            className="h-auto w-[157px] md:w-[262px]"
          />
        </div>
      </section>

      {/* Full-width estate view — desktop is framed top and bottom by a 2px
          white divider; mobile keeps the original dark theme, unchanged. */}
      <section className="relative mt-[2px] h-[300px] w-full md:mt-0 md:h-[531px] md:border-y-2 md:border-white">
        <Image
          src="/images/bynight-1.png"
          alt="Aerial view over Can Sakhara lit up at night"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Glorious afterhours */}
      <section className="flex h-[588px] w-full flex-col items-center bg-[#000e16] px-5 pt-[60px] md:h-[736px] md:px-0 md:pt-[116px]">
        <div className="flex w-full flex-col items-center gap-[25px] md:w-[1064px] md:gap-[50px]">
          <div className="text-center font-display text-[30px] uppercase leading-none text-white md:text-[48px]">
            <p className="font-thin tracking-[6px] indent-[3px] md:tracking-[3.2px] md:indent-[1.6px]">
              Glorious
            </p>
            <p className="font-light tracking-[6px] indent-[3px] md:tracking-[9.6px] md:indent-[4.8px]">
              Afterhours
            </p>
          </div>
          <p className="w-[322px] text-center font-serif text-[15px] font-light italic leading-[1.8] tracking-[1.5px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]">
            As the sun sets over the island,
            <br />
            Can Sakhara comes alive in the glow of the afterhours
          </p>
          <div className="flex w-full max-w-[312px] flex-col items-center gap-[18px] text-center font-body text-[11px] font-light leading-[1.6] tracking-[0.55px] text-white md:w-auto md:max-w-none md:flex-row md:items-start md:justify-center md:gap-[19.5px] md:text-left md:text-[16px] md:tracking-[0.8px]">
            <p className="md:w-[380px] md:text-right">
              The golden hour takes hold and Ibiza puts on a show. As daylight
              fades, Can Sakhara transforms into a warm and cinematic retreat.
              Your soundtrack flows seamlessly throughout the house as cocktails
              are mixed at the bar and dinner lingers long into the evening. From
              intimate corners to art-filled living spaces, every room is made
              for nights to remember.
            </p>
            <p className="md:w-[380px]">
              Outside, the magic deepens. The pool glows from within, the gardens
              are bathed in warm golden light, and the shimmering lights of Ibiza
              sparkle in the distance. Watch a film beneath the stars on the
              spectacular outdoor screen, share one final drink by the water, and
              savour long, unhurried conversations under the night sky. Within
              moments of the island’s most iconic nightlife, yet a world away.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery — always a white band. Desktop: a looping draggable carousel.
          Mobile: the original snap-scrolling peek strip (278px slides). */}
      <section className="w-full bg-white py-[20px] md:py-[30px]">
        <GalleryCarousel images={galleryImages} />
      </section>

      {/* Solace of slumber */}
      <section className="flex h-[332px] w-full flex-col items-center bg-[#031927] px-5 pt-[60px] md:h-[580px] md:px-0 md:pt-[115px]">
        <div className="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[50px]">
          <h2 className="text-center font-display text-[24px] font-light uppercase leading-none tracking-[4.8px] text-white indent-[2.4px] md:text-[34px] md:leading-[1.4] md:tracking-[6.8px] md:indent-[3.4px]">
            Solace of Slumber
          </h2>
          <p className="w-[312px] text-center font-serif text-[13px] font-light italic leading-[1.8] tracking-[1.3px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]">
            Whether retreating to the Primary Suite or one of seven individually
            designed guest rooms, each offers a private sanctuary where the day
            dissolves into deep, restorative rest.
          </p>
          <SecondaryButton href="mailto:reservations@cansakhara.com">
            Enquire
          </SecondaryButton>
        </div>
      </section>

      {/* Full-width pool view */}
      <section className="relative mt-[2px] h-[266px] w-full md:h-[663px]">
        <Image
          src="/images/bynight-2.png"
          alt="The illuminated pool and terraces of Can Sakhara from above"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Footer */}
      <SiteFooter theme="night" className="mt-[2px]" />
    </main>
  );
}
