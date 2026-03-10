import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katakana Memotest | Nishi Nihongo Gakko",
  description: "Practice Katakana with this memory game - 西日本語学園",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
