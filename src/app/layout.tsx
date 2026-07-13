import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "GAMA | Next-Generation AI-Powered Health Intelligence Platform",
  description: "An AI-first Health Operating System where LLMs, AI agents, automation, predictive analytics, and intelligent workflows power your health journey.",
  openGraph: {
    title: "GAMA | Next-Generation AI Health Intelligence Platform",
    description: "An AI-first Health Operating System where LLMs, AI agents, automation, and predictive analytics power your health.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GAMA Health Intelligence Platform",
    description: "AI-first Health Operating System",
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
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
