"use client";

import { useState } from "react";
import { Box, Container, Toolbar } from "@mui/material";
import AuthGuard from "./_components/AuthGuard";
import Header from "./_components/Header";
import Lnb from "./_components/Lnb";

const expandedDrawerWidth = 260;
const collapsedDrawerWidth = 76;

export default function MainLayout({ children }) {
  const [isDesktopLnbCollapsed, setIsDesktopLnbCollapsed] = useState(false);
  const [isMobileLnbOpen, setIsMobileLnbOpen] = useState(false);
  const desktopDrawerWidth = isDesktopLnbCollapsed ? collapsedDrawerWidth : expandedDrawerWidth;

  return (
    <AuthGuard>
      <Box sx={{ bgcolor: "background.default", display: "flex", minHeight: "100vh" }}>
        <Header
          desktopDrawerWidth={desktopDrawerWidth}
          isDesktopLnbCollapsed={isDesktopLnbCollapsed}
          onDesktopLnbToggle={() => setIsDesktopLnbCollapsed((collapsed) => !collapsed)}
          onMobileLnbOpen={() => setIsMobileLnbOpen(true)}
        />
        <Lnb
          collapsedWidth={collapsedDrawerWidth}
          expandedWidth={expandedDrawerWidth}
          isDesktopCollapsed={isDesktopLnbCollapsed}
          isMobileOpen={isMobileLnbOpen}
          onMobileClose={() => setIsMobileLnbOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            transition: (theme) =>
              theme.transitions.create("width", {
                duration: theme.transitions.duration.shorter,
                easing: theme.transitions.easing.sharp,
              }),
            width: { md: `calc(100% - ${desktopDrawerWidth}px)` },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }} />
          <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </AuthGuard>
  );
}
