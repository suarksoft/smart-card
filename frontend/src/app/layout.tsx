import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/lib/wallet-context"
import { Toaster as SonnerToaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Su Hakkı Tokenizasyon Sistemi",
  description: "Su tasarrufunu blockchain ile teşvik eden platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <WalletProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
            </SidebarInset>
            <Toaster />
            <SonnerToaster />
          </SidebarProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
