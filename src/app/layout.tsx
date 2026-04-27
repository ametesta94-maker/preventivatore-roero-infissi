import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Roero Infissi - Preventivatore",
    template: "%s | Roero Infissi",
  },
  description: "Sistema di preventivazione per serramenti e infissi",
  keywords: ["preventivi", "serramenti", "infissi", "Roero Infissi"],
  authors: [{ name: "Roero Infissi" }],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={roboto.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
