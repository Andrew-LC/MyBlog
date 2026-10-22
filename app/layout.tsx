import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Andrew Lamichhane — Developer & Digital Garden",
    template: "%s | Andrew Lamichhane",
  },
  description:
    "Full Stack Developer based in India. Exploring software architecture, Emacs Org-roam notes, and digital gardens.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col selection:bg-sakura-200 selection:text-sakura-900 dark:selection:bg-sakura-900/70 dark:selection:text-sakura-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 w-full max-w-4xl mx-auto px-5 pt-10 pb-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
