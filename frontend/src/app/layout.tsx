import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PajamaZero — Sub-100ms Clinical In-Basket Triage",
  description: "Autonomous Clinical In-Basket Triage & Delegation Engine powered by JEV System One (TypeSafe AI) & LangGraph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080d19] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
