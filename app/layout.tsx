import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Vehicler - Vehicle Shipping",
  description: "Safe, reliable, and affordable vehicle transport across all 50 states.",
  openGraph: {
    title: "Vehicler - Vehicle Shipping",
    description: "Safe, reliable, and affordable vehicle transport across all 50 states.",
    url: "https://vehicler.org",
    siteName: "Vehicler",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vehicler - Vehicle Shipping",
    description: "Safe, reliable, and affordable vehicle transport across all 50 states.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
