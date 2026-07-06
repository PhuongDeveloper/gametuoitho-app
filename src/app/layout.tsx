import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SideAdBanners from '@/components/layout/SideAdBanners';

export const metadata: Metadata = {
  title: 'GameTuoiTho.online - Trò chơi tuổi thơ | GBA & Java Online',
  description:
    'Chơi lại những trò chơi tuổi thơ huyền thoại ngay trên trình duyệt. Kho game GBA, Java (J2ME) khổng lồ, miễn phí, không cần tải về.',
  keywords: [
    'game tuổi thơ',
    'game GBA online',
    'game java online',
    'giả lập GBA',
    'game hoài niệm',
    'retro game',
    'game điện thoại cũ',
  ],
  openGraph: {
    title: 'GameTuoiTho.online - Trò chơi tuổi thơ',
    description: 'Chơi lại những trò chơi tuổi thơ huyền thoại ngay trên trình duyệt.',
    url: 'https://gametuoitho.online',
    siteName: 'GameTuoiTho',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#d63031" />
      </head>
      <body id="top" className="antialiased min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-1 w-full">
          <SideAdBanners>{children}</SideAdBanners>
        </main>
        <Footer />
      </body>
    </html>
  );
}
