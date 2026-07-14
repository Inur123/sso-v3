"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface ScrollResetContainerProps {
  children: React.ReactNode;
}

export function ScrollResetContainer({ children }: ScrollResetContainerProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto w-full">
      {children}
    </div>
  );
}
