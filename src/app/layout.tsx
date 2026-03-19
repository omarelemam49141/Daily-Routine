import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Providers } from "@/components/providers";
import { RegisterServiceWorker } from "@/components/register-sw";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const arabicFont = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-ar",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "روتين النظافة",
  description: "تنظيم روتين النظافة اليومي، الجدول، والميزانية",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "روتين النظافة",
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabicFont.variable} h-full`}>
      <body className="min-h-full pb-24 font-sans antialiased">
        <Providers>
          <RegisterServiceWorker />
          <div className="mx-auto min-h-full max-w-lg px-4 pt-4">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
