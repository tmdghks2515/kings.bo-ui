"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { authService } from "@/api/auth/authService";
import { authTokenStorage } from "@/api/httpClient";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

const SAVED_USERNAME_KEY = "kings.bo.savedUsername";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [username, setUsername] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (authResult, variables) => {
      authTokenStorage.set(authResult);
      setAuth(authResult);

      if (rememberUsername) {
        window.localStorage.setItem(SAVED_USERNAME_KEY, variables.username);
      } else {
        window.localStorage.removeItem(SAVED_USERNAME_KEY);
      }

      router.push("/");
    },
  });

  useEffect(() => {
    const savedUsername = window.localStorage.getItem(SAVED_USERNAME_KEY) ?? "";

    setUsername(savedUsername);
    setRememberUsername(Boolean(savedUsername));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation.reset();

    const formData = new FormData(event.currentTarget);
    const submittedUsername = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    loginMutation.mutate({
      username: submittedUsername,
      password,
    });
  };

  const errorMessage =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : loginMutation.isError
        ? "로그인 처리 중 오류가 발생했습니다."
        : "";
  const isSubmitting = loginMutation.isPending;

  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "background.default",
        display: "flex",
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3}>
          <Stack alignItems="center">
            <Image
              src="/logo/thekingslogo2.png"
              width={180}
              height={32}
              alt="THE KINGS"
              style={{ height: "auto" }}
            />
            <Image
              src="/logo/thekingstextlogo.png"
              width={250}
              height={32}
              alt="THE KINGS"
              style={{ height: "auto" }}
            />
            <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
              Backoffice Management
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              p: { xs: 3, sm: 4 },
            }}
          >
            <Stack component="form" spacing={2.25} onSubmit={handleSubmit}>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

              <TextField
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                fullWidth
                label="아이디"
                name="username"
                placeholder="관리자 아이디"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <TextField
                autoComplete="current-password"
                disabled={isSubmitting}
                fullWidth
                label="비밀번호"
                name="password"
                placeholder="비밀번호"
                required
                type="password"
              />

              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberUsername}
                      disabled={isSubmitting}
                      size="small"
                      onChange={(event) => setRememberUsername(event.target.checked)}
                    />
                  }
                  label="아이디 저장"
                  sx={{ mr: 0 }}
                />
              </Stack>

              <Button
                disabled={isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                {isSubmitting ? <CircularProgress color="inherit" size={20} /> : "로그인"}
              </Button>
            </Stack>
          </Paper>

          <Typography color="text.secondary" textAlign="center" variant="caption">
            접근 권한이 없는 경우 시스템 관리자에게 문의하세요.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
