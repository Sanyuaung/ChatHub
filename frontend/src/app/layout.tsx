import type { Metadata } from "next";
import { ColorSchemeScript } from "@mantine/core";
import "./globals.css";
import ThemeProviderClient from "./ThemeProviderClient";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Chat Hub - Real-time Chat Application",
  description: "Real-time chat application built with Next.js and Socket.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "Inter, sans-serif" }}>
        <ThemeProviderClient>{children}</ThemeProviderClient>
      </body>
    </html>
  );
}
