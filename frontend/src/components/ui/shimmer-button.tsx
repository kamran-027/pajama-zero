"use client";

import React from "react";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerButton({
  children,
  className = "",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={`inline-flex h-10 animate-shimmer items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 px-5 font-semibold text-white transition-all shadow-sm hover:shadow active:scale-[0.98] text-xs ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
