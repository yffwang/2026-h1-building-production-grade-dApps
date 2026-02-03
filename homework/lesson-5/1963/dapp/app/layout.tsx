import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polkadot Hub - Zero To Hero DApp",
  description: "A simple dApp interacting with Polkadot Hub TestNet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
