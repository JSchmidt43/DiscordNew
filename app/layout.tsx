import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModelProvider } from "@/components/providers/model-provider";
import { Toaster } from "react-hot-toast";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DCord",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
    <link rel="icon" href="/next.svg" />
      <body className={cn(openSans.className, "bg-white dark:bg-[#313338]")}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <ModelProvider />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
        <Toaster position="top-center" reverseOrder={false} /> {/* Toaster without children */}
      </body>
    </html>
  </ClerkProvider>
  );
}
