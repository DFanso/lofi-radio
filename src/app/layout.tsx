import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Lofi Radio | Relax, Study, Focus",
  description: "Stream the best lofi beats and ambient music from around the world. Perfect for studying, relaxing, or focusing.",
  keywords: ["lofi", "radio", "music", "ambient", "study", "focus", "relax"],
  authors: [{ name: "Lofi Radio Team" }],
  creator: "Lofi Radio",
  publisher: "Lofi Radio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Lofi Radio | Relax, Study, Focus",
    description: "Stream the best lofi beats and ambient music from around the world.",
    siteName: "Lofi Radio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lofi Radio - Stream lofi beats and ambient music",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lofi Radio | Relax, Study, Focus",
    description: "Stream the best lofi beats and ambient music from around the world.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: "#7c3aed",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
