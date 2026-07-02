"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { authService } from "@/api/auth/authService";
import { authTokenStorage } from "@/api/httpClient";
import { useAuthStore } from "@/stores/authStore";

export default function Header({ drawerWidth }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const username = user?.username ?? "-";
  const avatarText = username ? username.slice(0, 1).toUpperCase() : "-";

  const clearSession = () => {
    authTokenStorage.clear();
    clearAuth();
    router.replace("/login");
  };

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: clearSession,
  });

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
        <Box sx={{ flex: 1, minWidth: 0 }} />

        <Stack
          alignItems="center"
          direction="row"
          divider={<Divider flexItem orientation="vertical" />}
          spacing={2}
        >
          <Stack alignItems="center" direction="row" spacing={1.25}>
            <Avatar sx={{ height: 34, width: 34 }}>{avatarText}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2">{username}</Typography>
            </Box>
          </Stack>
          <Button
            color="inherit"
            disabled={logoutMutation.isPending}
            startIcon={<LogoutIcon fontSize="small" />}
            variant="text"
            onClick={() => logoutMutation.mutate()}
          >
            로그아웃
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
