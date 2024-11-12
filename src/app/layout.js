// layout.js
'use client';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import localFont from "next/font/local";
import applyFloatingBubbles from '@/lib/floatingBubbles'; // Ton fichier d'animation
import "./globals.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  useEffect(() => {
    applyFloatingBubbles(); // Active l’animation
  }, []);

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden`} // Remplacé overflow-hidden par overflow-x-hidden
        style={{ backgroundColor: '#000', color: '#fff' }} // Fond noir pour l'effet de lumière
      >
        <div id="light-effect"></div> {/* Effet lumineux au bas de la page */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}