import { Toaster } from '@/components/ui/toaster';
import { NotesProvider } from '@/contexts/NotesContext';
import { FloatingAIButton } from '@/components/FloatingAIButton';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NotesProvider>
          {children}
          <FloatingAIButton />
          <Toaster />
        </NotesProvider>
      </body>
    </html>
  );
} 