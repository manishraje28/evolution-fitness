import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evolution Fitness Thane | Evolve Or Remain The Same",
  description: "The premier high-performance training ground in Vartak Nagar, Thane. Experience state-of-the-art strength equipment, CrossFit conditioning, infrared saunas, and elite coaching.",
  keywords: ["gym in Thane", "best gym in Vartak Nagar", "Evolution Fitness", "crossfit Thane", "personal trainer Thane"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
