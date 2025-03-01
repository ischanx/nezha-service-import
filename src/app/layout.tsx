import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '哪吒监控 - 三网监控一键导入',
  description: '快速导入三网监控任务到哪吒监控系统',
  keywords: '哪吒监控,监控系统,一键导入,批量导入,服务器监控,三网监控,IPv4,IPv6',
  authors: [{ name: 'ischanx' }],
  openGraph: {
    title: '哪吒监控 - 三网监控一键导入',
    description: '快速导入三网监控任务到哪吒监控系统',
    url: 'https://nezha.chanx.tech',
    siteName: '哪吒监控一键导入工具',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        {children}
        <script
          defer
          src="https://umami.showmecode.net/script.js"
          data-website-id="eb05536a-3941-479f-a97f-18b7c9dc791f"
        ></script>
      </body>
    </html>
  );
}
