import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppToaster from "@/components/toaster";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CampusClean - Campus Operations Management",
  description:
    "Real-time campus cleanliness tracking with verified photo evidence and accountability.",
  icons: {
    icon: "/Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Providers>
          {children}
          <AppToaster />
        </Providers>
      </body>
    </html>
  );
}
