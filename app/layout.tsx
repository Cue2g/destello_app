import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FlyonuiScript from "../components/FlyonuiScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      className={`${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased font-sans">
        {children}
        <FlyonuiScript />
      </body>
    </html>
  );
}
