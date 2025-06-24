import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AI Document Assistant",
  description: "Upload documents and ask AI-powered questions based on content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
