import "./globals.css";

export const metadata = {
  title: "bo-ui",
  description: "Back office UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
