import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Header from "@/components/Header";

// Metadata for the app (title, etc.)
export const metadata: Metadata = {
  title: "TSender",
};

export default function RootLayout(props: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap the app in all providers (wagmi, RainbowKit, React Query) */}
        <Providers>
          <Header />
          {/* Render the page content */}
          {props.children}
        </Providers>
      </body>
    </html>
  );
}

// 03 - This file defines the root layout of the application, 
// including metadata and global styles.