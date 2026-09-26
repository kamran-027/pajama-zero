"use client";

import React from "react";

export function BackgroundGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Crisp Clinical Dot Grid with Soft Vignette */}
      <div className="absolute inset-0 bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />
      
      {/* Soft Ambient Clinical Blue/Cyan Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-100/70 via-indigo-50/40 to-transparent blur-3xl pointer-events-none rounded-full" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
