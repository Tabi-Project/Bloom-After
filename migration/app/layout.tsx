import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/layouts.css";

import "../styles/clinics.css";
import "../styles/admin-dashboard.css";
import "../styles/admin-login.css";
import "../styles/admin-moderation.css";
import "../styles/admin-settings.css";
import "../styles/content-management.css";
import "../styles/crisis-handling.css";
import "../styles/lifestyle.css";
import "../styles/ngos.css";
import "../styles/resources.css";
import "../styles/stories.css";
import "../styles/suggest-drawer.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloom After",
  description: "Bloom After - a safe, clinically grounded space for navigating postpartum depression.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
