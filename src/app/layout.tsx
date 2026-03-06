import type { Metadata } from "next";
import { Inter, Outfit, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const notoRS = Noto_Sans_Sinhala({
  subsets: ["sinhala", "latin"],
  variable: "--font-noto-sinhala",
  weight: ["400", "700", "900"],
});


export const metadata: Metadata = {
  title: "Premium Sinhala LMS - ඉගෙනුම් පද්ධතිය",
  description: "Advanced Learning Management System for Sinhala Medium Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si" className={`${inter.variable} ${outfit.variable} ${notoRS.variable}`}>
      <body className="antialiased">
        <div className="mesh-bg" />
        <main className="relative z-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
