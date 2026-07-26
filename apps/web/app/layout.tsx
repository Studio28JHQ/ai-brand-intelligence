import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from './components/AppHeader';

export const metadata: Metadata = {
  title: 'AI Visibility Auditor',
  description: 'Audit, optimize, and report on AI Visibility for your Clients.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <AppHeader />
          <div className="app-main">{children}</div>
        </div>
      </body>
    </html>
  );
}
