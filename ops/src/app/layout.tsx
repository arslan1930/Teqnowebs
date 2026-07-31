import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: {
    default: "Ops · Teqnowebs",
    template: "%s · Teqnowebs Ops",
  },
  description: "Link desk — clients, inventory, and monthly P&L for Teqnowebs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: "var(--font-figtree), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
