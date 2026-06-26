"use client";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuthStore } from "@/stores/authStore";

const getRoleLabel = (roles) => {
  if (!roles?.length) {
    return "권한 없음";
  }

  if (roles.includes("ADMIN")) {
    return "관리자";
  }

  return roles.join(", ");
};

export default function Header({ drawerWidth }) {
  const user = useAuthStore((state) => state.user);
  const username = user?.username ?? "-";
  const roleLabel = getRoleLabel(user?.roles);
  const avatarText = username ? username.slice(0, 1).toUpperCase() : "-";

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="fixed"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        ml: { md: `${drawerWidth}px` },
        width: { md: `calc(100% - ${drawerWidth}px)` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h1" variant="h6" sx={{ fontWeight: 700 }}>
            관리자 콘솔
          </Typography>
          <Typography color="text.secondary" variant="body2">
            운영 현황과 업무 메뉴를 관리합니다.
          </Typography>
        </Box>

        <Stack
          alignItems="center"
          direction="row"
          divider={<Divider flexItem orientation="vertical" />}
          spacing={2}
        >
          <Badge color="error" variant="dot">
            <Button color="inherit" size="small" variant="text">
              알림
            </Button>
          </Badge>

          <Stack alignItems="center" direction="row" spacing={1.25}>
            <Avatar sx={{ height: 34, width: 34 }}>{avatarText}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2">{username}</Typography>
              <Typography color="text.secondary" variant="caption">
                {roleLabel}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
