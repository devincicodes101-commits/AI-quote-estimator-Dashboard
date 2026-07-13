import type { Metadata } from "next"
import "./globals.css"
import { AutoRefresh } from "@/components/AutoRefresh"

export const metadata: Metadata = {
  title: "Squeegee Squad LA — Dashboard",
  description: "Lead pipeline, revenue mix, and margin protection at a glance.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f1117] text-gray-200 antialiased">
        <AutoRefresh intervalMs={15 * 60 * 1000} />
        {children}
      </body>
    </html>
  )
}
