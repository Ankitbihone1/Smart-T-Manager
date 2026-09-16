import "./globals.css";

export const metadata = {
  title: "Smart Task Manager",
  description: "Full-stack task management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
