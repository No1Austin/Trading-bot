import "../styles/globals.css";
import Navbar from "../components/Navbar";
import MatrixBackground from "../components/MatrixBackground";

export const metadata = { title: "AI Powered Trading Bot" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <MatrixBackground />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
