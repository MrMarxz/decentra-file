import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThirdwebProvider } from "thirdweb/react";

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
        <ThirdwebProvider>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
