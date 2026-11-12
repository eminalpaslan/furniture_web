import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import messages from '../messages/tr.json';

export const metadata: Metadata = {
  title: messages.meta.title,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
