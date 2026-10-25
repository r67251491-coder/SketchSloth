import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKETCHSLOTH — NAPKIN-TO-CODE",
  description: "Spatial brutalist napkin-to-code compiler powered by local Ollama vision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased scroll-smooth`}
    >
      <body className="min-h-screen bg-gray-50 text-black font-sans flex flex-col overflow-x-hidden overflow-y-auto selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
