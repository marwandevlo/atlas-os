import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AssistantOverlay } from "@/app/components/assistant/AssistantOverlay";
import { GlobalSearchOverlay } from "@/app/components/search/GlobalSearchOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAFIRIX PRO — Gestion d'entreprise",
  description: "Plateforme SaaS moderne pour la gestion d'entreprise, facturation et comptabilité",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TEMPORARY: hide the floating assistant launcher globally.
  // Re-enable by setting NEXT_PUBLIC_ATLAS_ENABLE_ASSISTANT_OVERLAY="true".
  const enableAssistantOverlay = process.env.NEXT_PUBLIC_ATLAS_ENABLE_ASSISTANT_OVERLAY === "true";
  // TEMPORARY: hide the global search overlay (full-screen fixed overlay).
  // Re-enable by setting NEXT_PUBLIC_ATLAS_ENABLE_GLOBAL_SEARCH_OVERLAY="true".
  const enableGlobalSearchOverlay = process.env.NEXT_PUBLIC_ATLAS_ENABLE_GLOBAL_SEARCH_OVERLAY === "true";

  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
        <link rel="shortcut icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0F1F3D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ZAFIRIX PRO" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {enableGlobalSearchOverlay ? <GlobalSearchOverlay /> : null}
        {enableAssistantOverlay ? <AssistantOverlay /> : null}
      </body>
    </html>
  );
}