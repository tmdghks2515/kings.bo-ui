import "./globals.css";
import MuiThemeProvider from "../theme/MuiThemeProvider";

export const metadata = {
  title: "bo-ui",
  description: "Back office UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
