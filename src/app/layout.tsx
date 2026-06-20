import type { Metadata } from "next";
import {
  Montserrat,
  Source_Sans_3,
  Source_Serif_4,
} from "next/font/google";
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
      className={`${display.variable} ${body.variable} ${serif.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
