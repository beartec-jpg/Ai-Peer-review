// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes'; // Optional: For dark mode toggle (npm install next-themes)

// Metadata for SEO/head tags
export const metadata: Metadata = {
  title: 'AI Peer Review - Code Reviews by Grok AI',
  description: 'Get code reviews from three distinct Grok AI personalities: Critical, Supportive, and Technical.',
  keywords: ['AI coding assistant', 'code review', 'Grok AI', 'peer review'],
  authors: [{ name: 'Beartec' }],
  openGraph: {
    title: 'AI Peer Review',
    description: 'Multi-personality AI code reviews powered by Grok.',
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
