import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import FlyonuiScript from "../components/FlyonuiScript";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Destello",
  description: "Destello - Candidate Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <FlyonuiScript />
      </body>
    </html>
  );
}
