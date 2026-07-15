import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bridge — Stories that open doors",
  description: "AI-powered English storytelling support for crisis-affected learners.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
