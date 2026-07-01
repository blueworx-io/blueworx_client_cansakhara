import type { Metadata } from "next";
import {
  Montserrat,
  Source_Sans_3,
  Source_Serif_4,
} from "next/font/google";
import MotionRoot from "@/components/MotionRoot";
import SideProgressNav from "@/components/SideProgressNav";
import "./globals.css";

const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Can Sakhara | An Iconic Ibiza Home",
  description:
    "Discover Can Sakhara, a private art-filled villa overlooking Ibiza and Formentera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${serif.variable} antialiased`}
    >
      <body>
        {/* Pre-paint no-FOUC guard: hide above-the-fold hero entrance elements
            before first paint, but only when JS runs and motion is allowed.
            Runs during HTML parse, ahead of the hero markup below. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion-ready')}}catch(e){}",
          }}
        />
        {children}
        <SideProgressNav />
        <MotionRoot />
      </body>
    </html>
  );
}
