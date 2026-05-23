import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pattern English",
  description: "영어 패턴 문장 학습 앱 - B1에서 B2+까지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-slate-50">{children}</body>
    </html>
  );
}
