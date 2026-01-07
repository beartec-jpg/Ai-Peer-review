// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';

// Metadata for SEO/head tags
export const metadata: Metadata = {
  title: 'Peer AI Reviewer - Battle-Tested Coding Answers',
  description: 'Get refined, peer-reviewed AI responses for complex coding tasks.',
  keywords: ['AI coding assistant', 'peer review', 'code generation'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Peer AI Reviewer',
    description: 'Multi-model AI peer review for superior code solutions.',
    images: '/og-image.png', // Add a static image in /public if desired
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="min-h-screen flex flex-col items-center justify-center p-4">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
