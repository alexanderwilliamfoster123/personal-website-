import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const openGraphUrl = "/opengraph-image.png";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://alexander-foster-workshop.alexwfoster.chatgpt.site";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),

  title: "Alexander Foster",
  description: "By design",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
