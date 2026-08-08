import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '../src/providers/Providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Employee Management System',
  description: 'Enterprise Employee Management System with JWT Authentication',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} font-sans h-full antialiased dark`}
    >
      <body className={`${dmSans.className} min-h-full flex flex-col bg-slate-950 text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
