import type { Metadata } from "next";
import { Fraunces, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopRule } from "./components/TopRule";
import { Masthead } from "./components/Masthead";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
      className={`${fraunces.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <TopRule />
        <Masthead />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
