import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PajamaZero — Clinical In-Basket Triage Console",
  description: "Autonomous Clinical In-Basket Triage & Delegation Engine powered by JEV System One (TypeSafe AI) & LangGraph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500/20 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
