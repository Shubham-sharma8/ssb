import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export function BrandLogo({ className = "", size = 32 }: BrandLogoProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Light mode: dark logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt="COGIFY Logo"
        width={size}
        height={size}
        className="block dark:hidden w-full h-full object-contain select-none"
      />
      {/* Dark mode: white logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo_white.png"
        alt="COGIFY Logo"
        width={size}
        height={size}
        className="hidden dark:block w-full h-full object-contain select-none"
      />
    </span>
  );
}
