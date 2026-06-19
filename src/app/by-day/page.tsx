import type { Metadata } from "next";
import Image from "next/image";

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
      className={`inline-flex items-center justify-center gap-4 whitespace-nowrap border border-white px-8 py-4 font-display text-[14px] font-normal uppercase leading-[1.4] tracking-[5.6px] text-white transition-colors hover:bg-white hover:text-[#ac9a8c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`}
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
      <section className="relative h-[900px] w-full bg-[#ac9a8c]">
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
          <Image src="/images/sun.svg" alt="" width={110} height={110} />
          <h1
            className="font-display text-[56px] font-light uppercase leading-[1.4] text-white"
            style={{ letterSpacing: "28px", textIndent: "14px" }}
          >
            By Day
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
          src="/images/byday-1.png"
          alt="Aerial view over Can Sakhara and the hills of Ibiza"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Sun-drenched serenity */}
      <section className="flex h-[736px] w-full flex-col items-center bg-[#918074] pt-[116px]">
        <div className="flex w-[1064px] flex-col items-center gap-[50px]">
          <div className="text-center font-display text-[48px] uppercase leading-none text-white">
            <p className="font-extralight" style={{ letterSpacing: "3.2px", textIndent: "1.6px" }}>
              Sun-Drenched
            </p>
            <p className="font-light" style={{ letterSpacing: "9.6px", textIndent: "4.8px" }}>
              Serenity
            </p>
          </div>
          <p className="w-[1064px] text-center font-serif text-[28px] font-light italic leading-[1.8] tracking-[2.8px] text-white">
            A myriad of spaces, both inside and out,
            <br />
            inviting each guest to shape the day as they choose
          </p>
          <div className="flex w-[760px] gap-5 font-body text-[16px] font-light leading-[1.6] tracking-[0.8px] text-white">
            <p className="w-[370px] text-right">
              As morning light pours across the terraces, Can Sakhara reveals its
              most restorative side. Whether energised and productive or completely
              at ease, the house adapts intuitively to your mood. Begin with an
              espresso in the kitchen, sink into an Eames lounge chair with a book,
              retreat to the gym for a focused workout, or drift through rooms
              filled with art, colour and tactile textures.
            </p>
            <p className="w-[370px]">
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

      {/* Gallery row */}
      <section className="w-full bg-white py-[30px]">
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

      {/* Balearic bliss */}
      <section className="flex h-[529px] w-full flex-col items-center bg-[#ac9a8c] pt-[115px]">
        <div className="flex w-[1064px] flex-col items-center gap-[50px]">
          <h2
            className="text-center font-display text-[34px] font-light uppercase leading-[1.4] text-white"
            style={{ letterSpacing: "6.8px", textIndent: "3.4px" }}
          >
            Balearic Bliss
          </h2>
          <p className="w-[1064px] text-center font-serif text-[28px] font-light italic leading-[1.8] tracking-[2.8px] text-white">
            Whether seeking quiet restoration or vibrant island living, every
            moment unfolds with effortless ease beneath the Balearic sun.
          </p>
          <SecondaryButton href="mailto:reservations@cansakhara.com">
            Enquire
          </SecondaryButton>
        </div>
      </section>

      {/* Full-width terrace view */}
      <section className="relative mt-[2px] h-[663px] w-full">
        <Image
          src="/images/byday-2.png"
          alt="Sun loungers and planting on the terraces of Can Sakhara"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* Footer */}
      <footer className="mt-[2px] w-full bg-[#918074] px-20 pb-[50px] pt-[144px] text-white">
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
