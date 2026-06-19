import type { Metadata } from "next";
import Image from "next/image";

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

// Exact phone glyph from the Figma "call" component; uses currentColor so the
// button can recolour it on hover.
function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5 fill-current"
    >
      <path d="M5.45 4.16667C5.5 4.90833 5.625 5.63333 5.825 6.325L4.825 7.325C4.48333 6.325 4.26667 5.26667 4.19167 4.16667H5.45ZM13.6667 14.1833C14.375 14.3833 15.1 14.5083 15.8333 14.5583V15.8C14.7333 15.725 13.675 15.5083 12.6667 15.175L13.6667 14.1833ZM6.25 2.5H3.33333C2.875 2.5 2.5 2.875 2.5 3.33333C2.5 11.1583 8.84167 17.5 16.6667 17.5C17.125 17.5 17.5 17.125 17.5 16.6667V13.7583C17.5 13.3 17.125 12.925 16.6667 12.925C15.6333 12.925 14.625 12.7583 13.6917 12.45C13.6083 12.4167 13.5167 12.4083 13.4333 12.4083C13.2167 12.4083 13.0083 12.4917 12.8417 12.65L11.0083 14.4833C8.65 13.275 6.71667 11.35 5.51667 8.99167L7.35 7.15833C7.58333 6.925 7.65 6.6 7.55833 6.30833C7.25 5.375 7.08333 4.375 7.08333 3.33333C7.08333 2.875 6.70833 2.5 6.25 2.5Z" />
    </svg>
  );
}

// The bordered "Secondary Button" (phone icon + label) from the design system.
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
      className={`inline-flex items-center justify-center gap-4 whitespace-nowrap border border-white px-8 py-4 font-display text-[14px] font-normal uppercase leading-[1.4] tracking-[5.6px] text-white transition-colors hover:bg-white hover:text-[#031927] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`}
    >
      <PhoneIcon />
      <span>{children}</span>
    </a>
  );
}

export default function ByNight() {
  return (
    <main className="site-shell h-screen overflow-x-hidden overflow-y-auto bg-[#000e16] text-white">
      {/* Hero — flat By Night navy, transparent navbar over it */}
      <section className="relative h-[900px] w-full bg-[#031927]">
        <nav className="absolute inset-x-0 top-0 z-10 h-[131px] backdrop-blur-[3px]">
          <div className="mx-auto grid h-full w-[1280px] grid-cols-[1fr_auto_1fr] items-center">
            <a
              href="#"
              className="flex items-center gap-6 justify-self-start font-display text-[14px] font-normal uppercase tracking-[5.6px] text-white"
            >
              <span aria-hidden="true" className="flex w-12 flex-col gap-2">
                <span className="h-[2px] w-full bg-white" />
                <span className="h-[2px] w-full bg-white" />
              </span>
              <span>Menu</span>
            </a>
            <a href="/" aria-label="Can Sakhara home" className="justify-self-center">
              <Image src="/images/logo-white.svg" alt="Can Sakhara" width={52} height={52} />
            </a>
            <div className="justify-self-end">
              <SecondaryButton href="mailto:reservations@cansakhara.com">
                Enquire
              </SecondaryButton>
            </div>
          </div>
        </nav>

        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[131px] h-px w-[1280px] -translate-x-1/2 bg-white"
        />

        <div className="absolute left-1/2 top-[304px] flex w-[1064px] -translate-x-1/2 flex-col items-center gap-[60px]">
          <Image src="/images/moon.svg" alt="" width={110} height={110} />
          <h1
            className="font-display text-[56px] font-light uppercase leading-[1.4] text-white"
            style={{ letterSpacing: "28px", textIndent: "14px" }}
          >
            By Night
          </h1>
          <Image
            src="/images/hero-wordmark.svg"
            alt="Can Sakhara"
            width={262}
            height={20}
          />
        </div>
      </section>

      {/* Full-width estate view */}
      <section className="relative mt-[2px] h-[531px] w-full">
        <Image
          src="/images/bynight-1.png"
          alt="Aerial view over Can Sakhara lit up at night"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Glorious afterhours */}
      <section className="flex h-[736px] w-full flex-col items-center bg-[#000e16] pt-[116px]">
        <div className="flex w-[1064px] flex-col items-center gap-[50px]">
          <div className="text-center font-display text-[48px] uppercase leading-none text-white">
            <p className="font-extralight" style={{ letterSpacing: "3.2px", textIndent: "1.6px" }}>
              Glorious
            </p>
            <p className="font-light" style={{ letterSpacing: "9.6px", textIndent: "4.8px" }}>
              Afterhours
            </p>
          </div>
          <p className="w-[1064px] text-center font-serif text-[28px] font-light italic leading-[1.8] tracking-[2.8px] text-white">
            As the sun sets over the island,
            <br />
            Can Sakhara comes alive in the glow of the afterhours
          </p>
          <div className="flex justify-center gap-[19.5px] font-body text-[16px] font-light leading-[1.6] tracking-[0.8px] text-white">
            <p className="w-[380px] text-right">
              The golden hour takes hold and Ibiza puts on a show. As daylight
              fades, Can Sakhara transforms into a warm and cinematic retreat.
              Your soundtrack flows seamlessly throughout the house as cocktails
              are mixed at the bar and dinner lingers long into the evening. From
              intimate corners to art-filled living spaces, every room is made
              for nights to remember.
            </p>
            <p className="w-[380px]">
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

      {/* Gallery row */}
      <section className="w-full bg-[#000e16] py-[30px]">
        <div className="mx-auto flex w-[1440px] justify-between">
          {galleryImages.map((image) => (
            <div key={image.src} className="relative h-[663px] w-[460px]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="460px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Solace of slumber */}
      <section className="flex h-[580px] w-full flex-col items-center bg-[#031927] pt-[115px]">
        <div className="flex w-[1064px] flex-col items-center gap-[50px]">
          <h2
            className="text-center font-display text-[34px] font-light uppercase leading-[1.4] text-white"
            style={{ letterSpacing: "6.8px", textIndent: "3.4px" }}
          >
            Solace of Slumber
          </h2>
          <p className="w-[1064px] text-center font-serif text-[28px] font-light italic leading-[1.8] tracking-[2.8px] text-white">
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
      <section className="relative mt-[2px] h-[663px] w-full">
        <Image
          src="/images/bynight-2.png"
          alt="The illuminated pool and terraces of Can Sakhara from above"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Footer */}
      <footer className="mt-[2px] w-full bg-[#000e16] px-20 pb-[50px] pt-[144px] text-white">
        <div className="mx-auto flex w-[1280px] flex-col gap-20">
          <div className="relative h-[486px] w-full">
            <Image
              src="/images/mel-de-magranetes.svg"
              alt="Mel de Magranetes"
              width={259}
              height={86}
              className="absolute left-[510px] top-[20px]"
            />
            <a
              href="#"
              className="absolute left-[321px] top-[187.71px] block h-[75px] w-[223px]"
            >
              <Image src="/images/can-sakhara-footer.svg" alt="Can Sakhara" fill />
            </a>
            <a
              href="#"
              className="absolute left-[735.77px] top-[187.71px] block h-[75px] w-[223px]"
            >
              <Image src="/images/can-ergah.svg" alt="Can Ergâh" fill />
            </a>
          </div>

          <span aria-hidden="true" className="h-px w-full bg-white" />

          <div className="flex items-center font-display text-[14px] font-light uppercase leading-[1.2] tracking-[2.8px] text-white">
            <p className="flex-1">© 2026 Mel de Magranetes SL</p>
            <nav className="flex items-center gap-10">
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
