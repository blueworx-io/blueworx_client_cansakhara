import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

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

// Exact phone glyph from the Figma "call" component; uses currentColor so the
// button can recolour it on hover.
function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4 fill-current md:size-5"
    >
      <path d="M5.45 4.16667C5.5 4.90833 5.625 5.63333 5.825 6.325L4.825 7.325C4.48333 6.325 4.26667 5.26667 4.19167 4.16667H5.45ZM13.6667 14.1833C14.375 14.3833 15.1 14.5083 15.8333 14.5583V15.8C14.7333 15.725 13.675 15.5083 12.6667 15.175L13.6667 14.1833ZM6.25 2.5H3.33333C2.875 2.5 2.5 2.875 2.5 3.33333C2.5 11.1583 8.84167 17.5 16.6667 17.5C17.125 17.5 17.5 17.125 17.5 16.6667V13.7583C17.5 13.3 17.125 12.925 16.6667 12.925C15.6333 12.925 14.625 12.7583 13.6917 12.45C13.6083 12.4167 13.5167 12.4083 13.4333 12.4083C13.2167 12.4083 13.0083 12.4917 12.8417 12.65L11.0083 14.4833C8.65 13.275 6.71667 11.35 5.51667 8.99167L7.35 7.15833C7.58333 6.925 7.65 6.6 7.55833 6.30833C7.25 5.375 7.08333 4.375 7.08333 3.33333C7.08333 2.875 6.70833 2.5 6.25 2.5Z" />
    </svg>
  );
}

// The bordered "Secondary Button" (phone icon + label) from the design system.
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
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap border border-white px-4 py-[10px] font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[4px] text-white transition-colors hover:bg-white hover:text-[#ac9a8c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:gap-4 md:px-8 md:py-4 md:text-[14px] md:tracking-[5.6px] ${className}`}
    >
      <PhoneIcon />
      <span>{children}</span>
    </a>
  );
}

export default function ByDay() {
  return (
    <main className="site-shell h-screen overflow-x-hidden overflow-y-auto bg-white text-white">
      {/* Hero — flat By Day taupe, transparent navbar over it */}
      <section className="relative flex h-screen w-full flex-col items-center bg-[#ac9a8c]">
        <SiteHeader theme="day" />

        <span
          aria-hidden="true"
          className="mt-[118px] h-px w-[362px] bg-white md:mt-[131px] md:w-[1280px]"
        />

        <div className="mt-[110px] flex w-full flex-col items-center gap-[30px] md:mt-[172px] md:w-[1064px] md:gap-[60px]">
          <Image
            src="/images/sun.svg"
            alt=""
            width={110}
            height={110}
            className="size-20 md:size-[110px]"
          />
          <h1 className="font-display text-[34px] font-light uppercase leading-[1.4] tracking-[17px] text-white indent-[8.5px] md:text-[56px] md:tracking-[28px] md:indent-[14px]">
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

      {/* Sun-drenched serenity */}
      <section className="flex h-[588px] w-full flex-col items-center bg-[#918074] px-5 pt-[60px] md:h-[736px] md:px-0 md:pt-[116px]">
        <div className="flex w-full flex-col items-center gap-[25px] md:w-[1064px] md:gap-[50px]">
          <div className="text-center font-display text-[30px] uppercase leading-none text-white md:text-[48px]">
            <p className="font-extralight tracking-[6px] indent-[3px] md:tracking-[3.2px] md:indent-[1.6px]">
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

      {/* Gallery — three images. Desktop: a fixed 1440 row. Mobile: a
          snap-scrolling peek carousel (278px slides, centred). */}
      <section className="w-full bg-white py-[20px] md:py-[30px]">
        <div className="flex snap-x snap-mandatory gap-[19px] overflow-x-auto px-[calc((100vw-278px)/2)] [-ms-overflow-style:none] [scrollbar-width:none] md:mx-auto md:w-[1440px] md:snap-none md:justify-between md:gap-0 md:overflow-x-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className="relative h-[400px] w-[278px] shrink-0 snap-center md:h-[663px] md:w-[460px]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 767px) 278px, 460px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
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
      <footer className="mt-[2px] w-full bg-[#918074] px-5 pb-[50px] pt-[80px] text-white md:px-20 md:pt-[144px]">
        <div className="mx-auto flex w-full flex-col gap-[30px] md:w-[1280px] md:gap-20">
          <div className="flex w-full flex-col items-center md:h-[486px]">
            <div className="relative mt-[28px] h-[59px] w-[177px] md:mt-[20px] md:h-[86px] md:w-[259px]">
              <Image
                src="/images/mel-de-magranetes.svg"
                alt="Mel de Magranetes"
                fill
              />
            </div>
            <div className="mt-[40px] flex w-full max-w-[340px] justify-between md:mt-[81.71px] md:w-auto md:max-w-none md:justify-normal md:gap-[191.77px]">
              <Link href="/" className="relative block h-[47px] w-[140px] md:h-[75px] md:w-[223px]">
                <Image src="/images/can-sakhara-footer.svg" alt="Can Sakhara" fill />
              </Link>
              <a href="#" className="relative block h-[47px] w-[140px] md:h-[75px] md:w-[223px]">
                <Image src="/images/can-ergah.svg" alt="Can Ergâh" fill />
              </a>
            </div>
          </div>

          <span aria-hidden="true" className="h-px w-full bg-white" />

          <div className="flex flex-col items-center gap-4 font-display text-[8px] font-light uppercase leading-[1.2] tracking-[1.6px] text-white md:flex-row md:items-center md:gap-0 md:text-[14px] md:tracking-[2.8px]">
            <p className="md:flex-1">© 2026 Mel de Magranetes SL</p>
            <nav className="flex items-center gap-6 md:gap-10">
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
              <a href="#">Privacy</a>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
