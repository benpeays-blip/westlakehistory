import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Westlake History — A community archive of Westlake, Texas",
  description:
    "Stories, photographs, maps, and oral histories of the people, places, schools, churches, and clubs of Westlake, Texas. Collected, preserved, and shared for the next hundred years.",
  metadataBase: new URL("https://westlakehistory.com"),
  openGraph: {
    title: "Westlake History",
    description:
      "A community archive of the people, places, schools, churches, and institutions of Westlake, Texas.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${sourceSans.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
