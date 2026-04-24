import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Initra — Initiate Infrastructure",
  description:
    "Generate perfect AGENTS.md, CLAUDE.md, and Cursor rules for your next project in 60 seconds. AI-powered project bootstrapping with community-driven discovery.",
  keywords: [
    "initra",
    "initiate infrastructure",
    "AGENTS.md",
    "CLAUDE.md",
    "cursor rules",
    "AI coding agent",
    "project bootstrapping",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('initra-theme') || 
                                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);

                  // Referral Capture
                  const urlParams = new URLSearchParams(window.location.search);
                  const ref = urlParams.get('ref');
                  if (ref) {
                    document.cookie = 'initra_ref=' + ref + '; path=/; max-age=2592000; samesite=lax';
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
