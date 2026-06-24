import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartPOS Pro – Hotel & Restaurant Billing",
  description:
    "Powerful, real-time POS billing software for hotels and restaurants. Manage menu, orders, and receipts with ease.",
  openGraph: {
    title: "SmartPOS Pro – Hotel & Restaurant Billing",
    description:
      "Powerful, real-time POS billing software for hotels and restaurants.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
