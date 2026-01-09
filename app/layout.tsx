import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import type { Metadata } from 'next';
import { HeaderBar } from '../components/HeaderBar';
import { BackButtonBar } from '../components/BackButtonBar';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpeedpayFX',
  description: 'Match USD and XAF exchange orders quickly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className + ' antialiased'}>
        <div className="min-h-screen bg-gradient-to-b from-sand via-white to-sand">
          <HeaderBar />
          <div className="pt-20">
            <BackButtonBar />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
