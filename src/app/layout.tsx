import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAMA | Next-Generation AI-Powered Health Intelligence Platform",
  description: "An AI-first Health Operating System where LLMs, AI agents, automation, predictive analytics, and intelligent workflows power your health journey.",
  manifest: "/manifest.json",
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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
