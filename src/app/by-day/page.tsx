import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GalleryCarousel from "@/components/GalleryCarousel";

export const metadata: Metadata = {
  title: "Can Sakhara | By Day",
  description:
    "Sun-drenched serenity at Can Sakhara — a myriad of spaces, both inside and out, inviting each guest to shape the day as they choose.",
};

const galleryImages = [
  { src: "/images/byday-gallery-1.png", alt: "Pool and terrace at Can Sakhara" },
  { src: "/images/byday-gallery-2.png", alt: "The villa framed by Mediterranean planting" },
  { src: "/images/byday-gallery-3.png", alt: "A light-filled interior at Can Sakhara" },
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
      className={`inline-flex items-center justify-center whitespace-nowrap border border-white px-4 py-[10px] font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[4px] text-white transition-colors hover:bg-white hover:text-[#ac9a8c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:px-8 md:py-4 md:text-[14px] md:tracking-[5.6px] ${className}`}
    >
      <span>{children}</span>
    </a>
  );
}

export default function ByDay() {
  return (
    <main className="site-shell h-screen overflow-x-hidden overflow-y-auto bg-white text-white">
      {/* Hero — flat By Day taupe, transparent navbar over it */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center bg-[#ac9a8c]">
        <SiteHeader theme="day" />

        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-[118px] mx-auto h-px w-[362px] bg-white md:top-[131px] md:w-[1280px]"
        />

        <div className="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[60px]">
          <Image
            src="/images/sun.svg"
            alt=""
            width={110}
            height={110}
            className="size-20 md:size-[110px]"
          />
          <h1 className="font-display text-[34px] font-light uppercase leading-[1.4] tracking-[17px] text-white indent-[17px] md:text-[56px] md:tracking-[28px] md:indent-[28px]">
            By Day
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

      {/* Full-width estate view */}
      <section className="relative mt-[2px] h-[300px] w-full md:h-[531px]">
        <Image
          src="/images/byday-1.png"
          alt="Aerial view over Can Sakhara and the hills of Ibiza"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Sun-drenched serenity — desktop is framed top and bottom by a 2px
          white divider; mobile keeps the original layout, unchanged. */}
      <section className="flex h-[588px] w-full flex-col items-center bg-[#918074] px-5 pt-[60px] md:h-[736px] md:border-y-2 md:border-white md:px-0 md:pt-[116px]">
        <div className="flex w-full flex-col items-center gap-[25px] md:w-[1064px] md:gap-[50px]">
          <div className="text-center font-display text-[30px] uppercase leading-none text-white md:text-[48px]">
            <p className="font-thin tracking-[6px] indent-[3px] md:tracking-[3.2px] md:indent-[1.6px]">
              Sun-Drenched
            </p>
            <p className="font-light tracking-[6px] indent-[3px] md:tracking-[9.6px] md:indent-[4.8px]">
              Serenity
            </p>
          </div>
          <p className="w-[322px] text-center font-serif text-[15px] font-light italic leading-[1.8] tracking-[1.5px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]">
            A myriad of spaces, both inside and out,
            <br />
            inviting each guest to shape the day as they choose
          </p>
          <div className="flex w-full max-w-[312px] flex-col items-center gap-[18px] text-center font-body text-[11px] font-light leading-[1.6] tracking-[0.55px] text-white md:w-[760px] md:max-w-none md:flex-row md:items-start md:gap-5 md:text-left md:text-[16px] md:tracking-[0.8px]">
            <p className="md:w-[370px] md:text-right">
              As morning light pours across the terraces, Can Sakhara reveals its
              most restorative side. Whether energised and productive or completely
              at ease, the house adapts intuitively to your mood. Begin with an
              espresso in the kitchen, sink into an Eames lounge chair with a book,
              retreat to the gym for a focused workout, or drift through rooms
              filled with art, colour and tactile textures.
            </p>
            <p className="md:w-[370px]">
              Outside, the experience opens up on an extraordinary scale. The
              shimmering pool lies at the centre of vast sun-drenched terraces,
              framed by lush planting and uninterrupted views. Sink into a sun
              lounger and soak up the warmth, or dine al fresco as long lunches
              unfold and conversations unfurl, while guests and generations of
              family gather for long, unhurried hours together.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery — three images. Desktop: a looping draggable carousel. Mobile:
          the original snap-scrolling peek strip (278px slides, centred). */}
      <section className="w-full bg-white py-[20px] md:py-[30px]">
        <GalleryCarousel images={galleryImages} />
      </section>

      {/* Balearic bliss */}
      <section className="flex h-[308px] w-full flex-col items-center bg-[#ac9a8c] px-5 pt-[60px] md:h-[529px] md:px-0 md:pt-[115px]">
        <div className="flex w-full flex-col items-center gap-[30px] md:w-[1064px] md:gap-[50px]">
          <h2 className="text-center font-display text-[24px] font-light uppercase leading-none tracking-[4.8px] text-white indent-[2.4px] md:text-[34px] md:leading-[1.4] md:tracking-[6.8px] md:indent-[3.4px]">
            Balearic Bliss
          </h2>
          <p className="w-[312px] text-center font-serif text-[13px] font-light italic leading-[1.8] tracking-[1.3px] text-white md:w-[1064px] md:text-[28px] md:tracking-[2.8px]">
            Whether seeking quiet restoration or vibrant island living, every
            moment unfolds with effortless ease beneath the Balearic sun.
          </p>
          <SecondaryButton href="mailto:reservations@cansakhara.com">
            Enquire
          </SecondaryButton>
        </div>
      </section>

      {/* Full-width terrace view */}
      <section className="relative mt-[2px] h-[266px] w-full md:h-[663px]">
        <Image
          src="/images/byday-2.png"
          alt="Sun loungers and planting on the terraces of Can Sakhara"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Footer */}
      <SiteFooter theme="day" className="mt-[2px]" />
    </main>
  );
}
