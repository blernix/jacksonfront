'use client';
import { SessionProvider } from 'next-auth/react';
import localFont from "next/font/local";
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
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Ajouter le SessionProvider ici */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}