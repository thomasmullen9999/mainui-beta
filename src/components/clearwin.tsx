"use client";

import * as React from "react";

interface ClearWinProps {
  attribute?: string | "class" | undefined;
  children: React.ReactNode;
}
export function ClearWin({ children, ...props }: ClearWinProps) {
  return (
    <div {...props} className="flex py-6 md:pt-12 justify-center">
      <div className="mx-auto w-full flex flex-col justify-center gap-4">
        {children}
      </div>
    </div>
  );
}
