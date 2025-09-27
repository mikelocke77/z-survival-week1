export const metadata = {
  title: "Keep Your Head — Survival Manual",
  description: "Week One Field Guide",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
