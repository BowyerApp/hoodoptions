import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Ticker } from "@/components/Ticker";
import { AmbientBackground } from "@/components/AmbientBackground";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hoodoptions.xyz"),
  title: "HoodOptions — Options on Robinhood Stock Tokens",
  description:
    "The options and USDG liquidity layer for tokenized stocks and RWAs on Robinhood Chain. Max loss = premium. No liquidation.",
  openGraph: {
    title: "HoodOptions — Options on Robinhood Stock Tokens",
    description:
      "Defined-risk markets for tokenized stocks. Max loss = premium.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HoodOptions — Defined-risk markets for tokenized stocks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HoodOptions — Defined-risk markets for tokenized stocks",
    description: "Max loss = premium. Built for Robinhood Chain.",
    images: ["/opengraph-image"],
  },
  icons: { icon: "/brand/mark.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${plex.variable} antialiased`}>
        <Providers>
          <AmbientBackground />
          <Nav />
          <Ticker />
          <main className="relative z-[1]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
