import type { Metadata } from "next";
import "./globals.css";

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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
