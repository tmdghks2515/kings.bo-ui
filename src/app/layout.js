import "./globals.css";
import MuiThemeProvider from "../theme/MuiThemeProvider";
import ConfirmProvider from "@/providers/ConfirmProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "bo-ui",
  description: "Back office UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <MuiThemeProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </MuiThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
