import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppDataProvider } from "@/components/AppDataProvider";
import { AppLockGate } from "@/components/AppLockGate";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/Nav";
import { PwaProvider } from "@/components/PwaProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stall Sales Manager",
  description: "Manage stall inventory and sales.",
  applicationName: "Stall Sales Manager",
  appleWebApp: {
    capable: true,
    title: "Stall Sales",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f6b63",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-background text-foreground">
        <PwaProvider>
          <AppLockGate>
            <div className="flex min-h-dvh flex-col">
              <Header />
              <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-32 sm:px-6">
                <AppDataProvider>{children}</AppDataProvider>
              </main>
              <MobileNav />
            </div>
          </AppLockGate>
        </PwaProvider>
      </body>
    </html>
  );
}
