"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../theme/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export default function MuiThemeProvider({ children }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
