import Image from "next/image";

export type FooterTheme = "home" | "day" | "night";

// The footer is identical on every page (Figma desktop 1:835 / mobile 1:352);
// only the background colour changes. Home is the Figma footer colour (which
// matches the home drawer mark in SiteHeader); day/night take each page's deep
// section colour. All footer content stays white on every theme.
const FOOTER_COLORS: Record<FooterTheme, string> = {
  home: "#422833",
  day: "#918074",
  night: "#000e16",
};

export default function SiteFooter({
  theme = "home",
  className = "",
}: {
  theme?: FooterTheme;
  className?: string;
}) {
  return (
    <footer
      id="contact"
      style={{ backgroundColor: FOOTER_COLORS[theme] }}
      className={`site-footer w-full px-5 pb-[calc(50px+env(safe-area-inset-bottom))] pt-[80px] text-white md:px-20 md:pb-[50px] md:pt-[144px] ${className}`}
    >
      <div className="mx-auto flex w-full flex-col gap-[30px] md:w-[1280px] md:gap-20">
        {/* Logo block — the Mel de Magranetes mark centred at the top, the two
            house brands in a centred row beneath. The block keeps the Figma
            fixed height (the marks sit in its upper portion). */}
        <div className="flex h-[293px] w-full flex-col items-center md:h-[486px]">
          <div
            data-anim="footer-item"
            className="relative mt-[28px] h-[59px] w-[177px] md:mt-[20px] md:h-[86px] md:w-[259px]"
          >
            <a
              href="https://mdmsl.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-full w-full"
            >
              <Image
                src="/images/mel-de-magranetes.svg"
                alt="Mel de Magranetes"
                fill
              />
            </a>
          </div>
          <div
            data-anim="footer-item"
            className="mt-[40px] flex justify-center gap-[51px] md:mt-[81.71px] md:gap-[191.77px]"
          >
            <a
              href="https://cansakhara.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-[47px] w-[140px] md:h-[75px] md:w-[223px]"
            >
              <Image src="/images/can-sakhara-footer.svg" alt="Can Sakhara" fill />
            </a>
            <a
              href="https://canergah.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-[47px] w-[140px] md:h-[75px] md:w-[223px]"
            >
              <Image src="/images/can-ergah.svg" alt="Can Ergâh" fill />
            </a>
          </div>
        </div>

        <span aria-hidden="true" className="h-px w-full bg-white" />

        {/* Bottom row — desktop: copyright left, links right on one line.
            Mobile: links above the copyright, both centred (Figma 1:849 desktop
            / 1:366 mobile). */}
        <div
          data-anim="footer-item"
          className="flex flex-col-reverse items-center gap-5 font-display text-[8px] font-light uppercase leading-[1.2] tracking-[1.6px] md:flex-row md:items-center md:gap-0 md:text-[14px] md:tracking-[2.8px]"
        >
          <p className="text-center md:flex-1 md:text-left">
            © 2026 Mel de Magranetes SL
          </p>
          <nav className="flex items-center gap-[60px] md:gap-10">
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
            <a href="#">Privacy</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
