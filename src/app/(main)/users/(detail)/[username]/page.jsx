"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { userService } from "@/api/user/userService";

const userKeys = {
  all: ["users"],
  detail: (username) => ["users", username],
};

const roleOptions = [
  { code: "SUPER_ADMIN", label: "슈퍼 관리자" },
  { code: "ADMIN", label: "관리자" },
  { code: "USER", label: "사용자" },
  { code: "DEVELOPER", label: "개발자" },
];

const toRoleOptions = (roles) => {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((role) => roleOptions.find((option) => option.code === (role.code ?? role)))
    .filter(Boolean);
};

export default function UserDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { username } = useParams();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);

  const userQuery = useQuery({
    queryKey: userKeys.detail(username),
    queryFn: () => userService.getUser(username),
    enabled: Boolean(username),
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload) => userService.updateUser(username, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.detail(username) }),
      ]);
      router.push("/users");
    },
  });

  useEffect(() => {
    if (!userQuery.data) {
      return;
    }

    setNickname(userQuery.data.nickname ?? "");
    setSelectedRoles(toRoleOptions(userQuery.data.roles));
  }, [userQuery.data]);

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUserMutation.reset();
    setPasswordError("");
    setRoleError("");

    if (password !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (selectedRoles.length === 0) {
      setRoleError("권한을 1개 이상 선택하세요.");
      return;
    }

    updateUserMutation.mutate({
      nickname: nickname.trim(),
      password: password || null,
      roles: selectedRoles.map((role) => role.code),
    });
  };

  const error = updateUserMutation.error ?? userQuery.error;
  const errorMessage =
    error instanceof Error ? error.message : error ? "사용자 처리 중 오류가 발생했습니다." : "";
  const isLoading = userQuery.isLoading;
  const isSubmitting = updateUserMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          사용자 상세
        </Typography>
        <Typography color="text.secondary" variant="body2">
          백오피스 사용자 정보를 확인하고 수정합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack component="form" spacing={2.5} sx={{ maxWidth: 760 }} onSubmit={handleSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
          {roleError ? <Alert severity="error">{roleError}</Alert> : null}

          <TextField disabled label="아이디" value={username ?? ""} />
          <TextField
            required
            autoComplete="name"
            disabled={isLoading || isSubmitting}
            label="닉네임"
            placeholder="사용자 닉네임을 입력하세요"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <TextField
            autoComplete="new-password"
            disabled={isLoading || isSubmitting}
            label="비밀번호"
            placeholder="변경할 때만 입력하세요"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>
                    <IconButton
                      edge="end"
                      disabled={isLoading || isSubmitting}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            autoComplete="new-password"
            disabled={isLoading || isSubmitting}
            error={Boolean(passwordError)}
            helperText={passwordError || " "}
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            type={showPassword ? "text" : "password"}
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />

          <Autocomplete
            multiple
            disableCloseOnSelect
            disabled={isLoading || isSubmitting}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.code === value.code}
            options={roleOptions}
            value={selectedRoles}
            onChange={(_, value) => {
              setSelectedRoles(value);
              if (value.length > 0) {
                setRoleError("");
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={Boolean(roleError)}
                helperText={roleError || " "}
                label="권한"
                placeholder="권한을 선택하세요"
              />
            )}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props;

              return (
                <li key={key} {...optionProps}>
                  <Checkbox checked={selected} sx={{ mr: 1 }} />
                  {option.label}
                </li>
              );
            }}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button color="inherit" disabled={isSubmitting} onClick={() => router.push("/users")}>
              목록
            </Button>
            <Button disabled={isLoading || isSubmitting} type="submit" variant="contained">
              {isSubmitting ? <CircularProgress color="inherit" size={20} /> : "저장"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
