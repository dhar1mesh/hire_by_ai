import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Round-0 AI Technical Interview System | OpenAI Realtime WebRTC",
  description:
    "Sub-second latency, two-way conversational AI technical interview with direct browser-to-OpenAI WebRTC audio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
