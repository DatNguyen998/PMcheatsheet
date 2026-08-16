import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/print.css";

export const metadata: Metadata = {
  title: "PMP Cheatsheet · Modern Knowledge Dashboard",
  description:
    "An interactive PMBOK 6th-edition study companion — search, bookmark, track progress and quiz yourself across the project management processes.",
};

// Sets the theme attribute before first paint (reading localStorage / OS
// preference) so there's no flash of the wrong theme while React hydrates.
// Mirrors what usePmStore() settles on after mount.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("pm.theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
