import "./globals.css";
import MuiThemeProvider from "../providers/MuiThemeProvider";
import ConfirmProvider from "@/providers/ConfirmProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "더킹즈컴퍼니 Back Office",
  description: "더킹즈컴퍼니 Back Office",
  icons: {
    icon: "/logo/thekingslogosmall.png",
  },
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
