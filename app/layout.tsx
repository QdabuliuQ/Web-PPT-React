import type { Metadata } from "next";
import "./globals.css";
import { WEB_FONT_STYLESHEET_HREF } from "@/fonts/stacks";

export const metadata: Metadata = {
  title: "WebPPT",
  description: "Web PPT Editor",
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('webppt-theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.dataset.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.dataset.theme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={WEB_FONT_STYLESHEET_HREF} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
