import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { NextStepProvider, NextStep } from "nextstepjs";
import { allTours } from "@/lib/tour-steps";
import { TourCard } from "@/components/tour/tour-card";

export const metadata: Metadata = {
  title: "Beachwatch Data Explorer",
  description: "Interactive data explorer for UK beach litter survey data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NextStepProvider>
              <NextStep
                steps={allTours}
                cardComponent={TourCard}
                shadowRgb="0,0,0"
                shadowOpacity="0.5"
              >
                {children}
              </NextStep>
              <Toaster />
            </NextStepProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
