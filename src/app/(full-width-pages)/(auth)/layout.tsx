import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen bg-white dark:bg-gray-900">
      <ThemeProvider>
        {/* Fullscreen + centered */}
        <div className="flex items-center justify-center w-full h-full">
          {children}
        </div>

        {/* Theme toggler */}
        {/* <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div> */}
      </ThemeProvider>
    </div>
  );
}
