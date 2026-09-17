import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const openGraphUrl = "/opengraph-image.png";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://mahogany-balsamic-large.ngrok-free.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: "Alexander Foster",
  description: "By design",
  openGraph: {
    title: "Alexander Foster",
    description: "By design",
    siteName: "Alexander Foster",
    type: "website",

    images: [
      {
        url: openGraphUrl,
        width: 1200,
        height: 630,
        alt: "Alexander Foster",
      },
    ],
  },

  // X / Twitter
  twitter: {
    card: "summary_large_image",
    title: "Alexander Foster",
    description: "By design",
    images: [openGraphUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}