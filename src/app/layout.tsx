import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SongLibraryProvider } from "@/hooks/SongLibraryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura — Music Player",
  description: "A premium, elegant music player built for the discerning listener.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23e11d48'/><circle cx='16' cy='16' r='5' fill='%230a0a0a'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-base text-text-primary antialiased">
        <AdminAuthProvider>
        <SongLibraryProvider>
          <ToastProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </ToastProvider>
        </SongLibraryProvider>
      </AdminAuthProvider>
      </body>
    </html>
  );
}