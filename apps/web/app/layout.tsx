import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from './components/AppHeader';
import { getClientI18nPayload } from '../lib/i18n/server';
import { I18nProvider } from '../lib/i18n/client';

export const metadata: Metadata = {
  title: 'AI Visibility Auditor',
  description: 'Audit, optimize, and report on AI Visibility for your Clients.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, messages, englishMessages } = await getClientI18nPayload();

  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale} messages={messages} englishMessages={englishMessages}>
          <div className="app-shell">
            <AppHeader />
            <div className="app-main">{children}</div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
