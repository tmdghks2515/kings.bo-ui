import { Box, Container, Toolbar } from "@mui/material";
import Header from "./_components/Header";
import Lnb from "./_components/Lnb";

const drawerWidth = 260;

export default function MainLayout({ children }) {
  return (
    <Box sx={{ bgcolor: "background.default", display: "flex", minHeight: "100vh" }}>
      <Header drawerWidth={drawerWidth} />
      <Lnb drawerWidth={drawerWidth} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
