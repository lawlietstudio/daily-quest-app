import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Daily Quest: ARISE",
  description: "Level up your life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.variable} font-sans antialiased bg-[#0B1120] text-white min-h-screen bg-[url('/bg-stars.png')] bg-cover bg-fixed`}
      >
        <div className="fixed inset-0 bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-black/90 -z-10" />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
