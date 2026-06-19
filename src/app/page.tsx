import Image from "next/image";
import Link from "next/link";
import ExperienceCarousel from "@/components/ExperienceCarousel";
import SiteHeader from "@/components/SiteHeader";

const features = [
  { value: "6061", unit: "m²", label: "Plot" },
  { value: "1261", unit: "m²", label: "House" },
  { value: "8", label: "Bedrooms" },
  { value: "16", label: "Sleeps" },
  { value: "7", label: "Bathrooms" },
  { value: "1", label: "Guest WC" },
];

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M7.2 3.8 9.4 8 7.8 9.7c1.3 2.7 3.7 5.1 6.4 6.5l1.8-1.6 4.1 2.2-.8 3.2c-.2.8-.9 1.3-1.7 1.3C9.4 20.7 3.3 14.6 2.7 6.4c0-.8.5-1.5 1.3-1.7l3.2-.9Z" />
    </svg>
  );
}

function OutlineButton({
  children,
  href,
  icon = false,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  icon?: boolean;
  className?: string;
}) {
  const classes = `outline-button inline-flex h-[54px] items-center justify-center gap-4 whitespace-nowrap border border-current px-8 font-display text-[14px] uppercase tracking-[0.4em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`;
  const content = (
    <>
      {icon && <PhoneIcon />}
      <span>{children}</span>
    </>
  );
  // Internal routes use next/link for client-side navigation; mailto/external
  // stay as a plain anchor.
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {content}
    </a>
  );
}

function SectionLine({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`section-line mx-auto block h-28 w-px bg-[#42071a] md:h-40 md:w-[2px] ${className}`}
    />
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`section-heading mx-auto w-full min-w-0 max-w-5xl text-center text-[#42081a] ${className}`}
    >
      <p className="section-eyebrow font-display text-sm uppercase tracking-[0.34em] md:text-[21px]">
        {eyebrow}
      </p>
      <h2 className="section-title mx-auto mt-9 max-w-full break-words font-display text-[22px] font-light uppercase leading-[1.3] tracking-[0.1em] md:text-5xl md:leading-none md:tracking-[0.2em]">
        {title}
      </h2>
      <p className="section-subtitle mx-auto mt-8 max-w-[calc(100vw-3rem)] break-words font-serif text-[17px] font-light italic leading-[1.8] tracking-[0.02em] md:mt-10 md:max-w-4xl md:text-[28px] md:tracking-[0.1em]">
        {subtitle}
      </p>
    </header>
  );
}

// Splits a line into per-character cells laid out with `justify-between`, so the
// letters spread to fill the line's fixed width with even gaps — first and last
// glyph flush to the edges. This makes two lines of differing natural width
// render at an identical width, matching the Figma lockup regardless of the
// font in use (the design's per-line letter-spacing only equalises in Neulis
// Sans; it does not transfer to the Montserrat substitute).
function JustifiedLine({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`flex w-full justify-between ${className}`}>
      {Array.from(text).map((char, i) => (
        <span key={`${char}-${i}`}>{char === " " ? " " : char}</span>
      ))}
    </span>
  );
}

// The "Introducing / Can Sakhara" lockup: two equal-width lines filling the
// fixed Figma title box (272px mobile / 435px desktop). "Introducing" is set a
// weight lighter (Neulis Sans Thin → Montserrat extra-light) than "Can Sakhara".
function WelcomeTitleLockup() {
  return (
    <>
      <span className="sr-only">Introducing Can Sakhara</span>
      <span aria-hidden="true" className="welcome-lockup mx-auto flex flex-col">
        <JustifiedLine
          text="INTRODUCING"
          className="welcome-lockup-line font-extralight"
        />
        <JustifiedLine text="CAN SAKHARA" className="welcome-lockup-line" />
      </span>
    </>
  );
}

function SunIcon() {
  return (
    <Image src="/images/sun.svg" alt="" width={180} height={180} />
  );
}

function MoonIcon() {
  return (
    <Image src="/images/moon.svg" alt="" width={180} height={180} />
  );
}

export default function Home() {
  return (
    <main className="site-shell h-screen overflow-x-hidden overflow-y-auto bg-white text-[#42081a]">
      <section className="hero-section relative h-[700px] md:h-[900px]">
        <Image
          src="/images/hero.png"
          alt="Can Sakhara villa in the hills of Ibiza"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20" />

        <SiteHeader theme="home" />

        <div className="hero-content absolute inset-x-5 top-[43%] z-10 -translate-y-1/2 text-center text-white">
          <h1 className="sr-only">Can Sakhara</h1>
          <Image
            src="/images/hero-wordmark.svg"
            alt=""
            width={655}
            height={50}
            className="hero-wordmark mx-auto h-auto w-[300px] sm:w-[520px] md:w-[655px]"
          />
          <div className="hero-actions mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/by-day"
              className="hero-choice flex h-[54px] w-40 items-center justify-center border border-white bg-[#ac9a8c] px-5 font-display text-xs uppercase tracking-[0.35em] transition-colors hover:bg-white hover:text-[#42081a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              By day
            </Link>
            <Link
              href="/by-night"
              className="hero-choice flex h-[54px] w-40 items-center justify-center border border-white bg-[#001c2b] px-5 font-display text-xs uppercase tracking-[0.35em] transition-colors hover:bg-white hover:text-[#001c2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              By night
            </Link>
          </div>
        </div>
      </section>

      <section id="welcome" className="welcome-section relative bg-white">
        <SectionLine className="welcome-line-top relative z-10 -mt-6" />
        <div className="welcome-inner px-6 pb-24 pt-16 md:px-16 md:pb-40">
          <SectionHeading
            className="welcome-heading"
            eyebrow="Welcome"
            title={<WelcomeTitleLockup />}
            subtitle="Ibiza beckons. An iconic home, reimagined. A view like no other"
          />

          <div className="welcome-content mx-auto mt-24 grid min-w-0 max-w-6xl items-center gap-14 min-[1440px]:mt-0 min-[1440px]:grid-cols-[666px_346px] min-[1440px]:gap-[90px]">
            <div className="map-frame relative mx-auto aspect-[1.24/1] w-full max-w-[620px]">
              <div className="map-art relative size-full">
                <Image
                  src="/images/ibiza-map.svg"
                  alt="Map of Ibiza showing the location of Can Sakhara"
                  fill
                  sizes="(max-width: 768px) 90vw, 495px"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="welcome-copy w-full min-w-0 max-w-[calc(100vw-3rem)] break-words font-body text-[15px] font-light leading-[1.75] tracking-[0.04em] min-[1440px]:max-w-none min-[1440px]:text-base">
              <p>
                Every so often the White Isle opens up to reveal one of her
                hidden gems, instantly challenging clichéd notions of the
                ‘real’ Ibiza.
              </p>
              <p className="mt-7">Welcome to Can Sakhara.</p>
              <p className="mt-7">
                Be the first to experience utmost privacy, coupled with
                absolute glamour. Colour for miles, amidst your own cinematic
                landscape. A hillside setting near to beach clubs, superclubs,
                and the island’s best restaurants, yet always tucked away.
                There for the taking or just the observing.
              </p>
              <p className="mt-7">
                Balearic rock ‘n roll, with a fine art heart.
              </p>
              <OutlineButton
                href="mailto:reservations@cansakhara.com"
                className="mt-10 hover:bg-[#42081a] hover:text-white"
              >
                Enquire
              </OutlineButton>
            </div>
          </div>

          <div className="features-block mx-auto mt-24 max-w-4xl md:mt-32">
            <h3 className="features-title text-center font-display text-lg uppercase tracking-[0.32em]">
              Featuring
            </h3>
            <div className="features-grid mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-6">
              {features.map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="feature-circle mx-auto flex size-16 flex-col items-center justify-center rounded-full bg-[#f2ebe2]">
                    <span className="font-serif text-xl leading-none">
                      {feature.value}
                    </span>
                    {feature.unit && (
                      <span className="mt-1 text-[9px]">{feature.unit}</span>
                    )}
                  </div>
                  <p className="mt-5 font-body text-[11px] uppercase tracking-[0.18em]">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SectionLine className="welcome-line-bottom" />
      </section>

      <ExperienceCarousel />

      <section id="discover" className="discover-section relative bg-white">
        <SectionLine className="discover-line-top" />
        <div className="discover-inner px-6 pb-28 pt-24 md:px-16 md:pb-0">
          <h2 className="discover-title text-center font-display text-lg uppercase tracking-[0.34em]">
            Discover
          </h2>
          <div className="discover-grid mx-auto mt-20 grid max-w-[1170px] gap-8 min-[1440px]:grid-cols-[550px_550px] min-[1440px]:gap-[70px]">
            <article className="discover-card flex aspect-square flex-col items-center justify-center bg-[#ac9a8c] px-6 text-center text-white">
              <SunIcon />
              <h3 className="discover-card-title mt-[50px] font-display text-4xl font-light uppercase tracking-[0.4em] md:text-5xl">
                By day
              </h3>
              <OutlineButton
                href="/by-day"
                className="mt-[50px] border-white hover:bg-white hover:text-[#ac9a8c]"
              >
                Explore
              </OutlineButton>
            </article>
            <article className="discover-card flex aspect-square flex-col items-center justify-center bg-[#031927] px-6 text-center text-white">
              <MoonIcon />
              <h3 className="discover-card-title mt-[50px] font-display text-4xl font-light uppercase tracking-[0.4em] md:text-5xl">
                By night
              </h3>
              <OutlineButton
                href="/by-night"
                className="mt-[50px] border-white bg-[#286b7e] hover:bg-white hover:text-[#001c2b]"
              >
                Explore
              </OutlineButton>
            </article>
          </div>
        </div>
        <SectionLine className="discover-line-bottom" />
      </section>

      <section className="video-section relative h-[430px] md:h-[600px]">
        <Image
          src="/images/video-cover.png"
          alt="Panoramic view from Can Sakhara over Ibiza"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <button
          type="button"
          aria-label="Play Can Sakhara film"
          className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:size-[170px]"
        >
          <Image src="/images/play.svg" alt="" fill sizes="170px" />
        </button>
      </section>

      <footer
        id="contact"
        className="site-footer relative flex min-h-[760px] flex-col bg-[#492735] px-6 py-24 text-white md:h-[932px] md:min-h-0 md:px-20 md:py-0"
      >
        <div className="footer-parent-logo relative mx-auto h-[86px] w-[259px]">
          <Image src="/images/mel-de-magranetes.svg" alt="Mel de Magranetes" fill />
        </div>

        <div className="footer-brands mx-auto mt-20 grid w-full max-w-3xl gap-16 text-center sm:grid-cols-2 md:mt-0">
          <Link href="/" className="relative mx-auto block h-[75px] w-[223px]">
            <Image src="/images/can-sakhara-footer.svg" alt="Can Sakhara" fill />
          </Link>
          <a href="#" className="relative mx-auto block h-[75px] w-[223px]">
            <Image src="/images/can-ergah.svg" alt="Can Ergâh" fill />
          </a>
        </div>

        <div className="footer-bottom mt-auto border-t border-white/70 pt-10 font-body text-[11px] uppercase tracking-[0.22em]">
          <div className="flex flex-col gap-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>© 2026 Mel de Magranetes SL</p>
            <nav className="flex justify-center gap-7 sm:justify-end">
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
