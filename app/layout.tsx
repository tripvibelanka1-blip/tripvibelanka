import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tripvibe Lanka | Luxury Sri Lanka Tours & Private Chauffeur Travel",
  description:
    "Experience bespoke Sri Lankan journeys with Tripvibe Lanka. Handcrafted luxury tour packages, private chauffeur fleet, cultural odysseys, and scenic coastal escapes.",
  keywords: [
    "Sri Lanka Luxury Tours",
    "Private Chauffeur Sri Lanka",
    "Bespoke Travel Sri Lanka",
    "Sigiriya Tours",
    "Ella Scenic Train Tour",
    "Mirissa Whale Watching",
    "Yala Wildlife Safari",
    "Tripvibe Lanka",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
};

import { CurrencyProvider } from "@/context/CurrencyContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${plusJakartaSans.variable} scroll-smooth antialiased overflow-x-clip max-w-full`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-slate-900 font-body selection:bg-orange-500/20 selection:text-orange-900 overflow-x-clip max-w-full relative"
      >
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
