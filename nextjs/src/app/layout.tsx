import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import { TRPCReactProvider } from "@/trpc/react";
import { ThirdwebProvider } from "thirdweb/react";
import Navbar from "@/components/custom/navbar";

export const metadata: Metadata = {
  title: "Decentra-File",
  description: "Decentralized file storage",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <head>
          <script defer src="https://cloud.umami.is/script.js" data-website-id="52c4ae44-53af-4ea2-b408-e32d33a6219c"></script>
        </head>
        <ThirdwebProvider>
          <TRPCReactProvider>
            <Toaster />
            <Navbar />
            <main className="flex min-h-screen flex-col items-center bg-[#333333] text-white">
              {children}
            </main>
          </TRPCReactProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
