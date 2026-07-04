"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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

const roleOptions = [
  { code: "SUPER_ADMIN", label: "슈퍼 관리자" },
  { code: "ADMIN", label: "관리자" },
  { code: "USER", label: "사용자" },
  { code: "DEVELOPER", label: "개발자" },
];

export default function UserCreatePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([roleOptions[2]]);

  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      router.push("/users");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    createUserMutation.reset();
    setPasswordError("");
    setRoleError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (selectedRoles.length === 0) {
      setRoleError("권한을 1개 이상 선택하세요.");
      return;
    }

    createUserMutation.mutate({
      username: String(formData.get("username") ?? "").trim(),
      nickname: String(formData.get("nickname") ?? "").trim(),
      password,
      roles: selectedRoles.map((role) => role.code),
    });
  };

  const error = createUserMutation.error;
  const errorMessage =
    error instanceof Error ? error.message : error ? "사용자 생성 중 오류가 발생했습니다." : "";
  const isSubmitting = createUserMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          사용자 생성
        </Typography>
        <Typography color="text.secondary" variant="body2">
          백오피스 로그인에 사용할 사용자 정보를 입력합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack component="form" spacing={2.5} sx={{ maxWidth: 760 }} onSubmit={handleSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
          {roleError ? <Alert severity="error">{roleError}</Alert> : null}

          <TextField
            required
            autoComplete="username"
            disabled={isSubmitting}
            label="아이디"
            name="username"
            placeholder="로그인 아이디를 입력하세요"
          />
          <TextField
            required
            autoComplete="name"
            disabled={isSubmitting}
            label="닉네임"
            name="nickname"
            placeholder="사용자 닉네임을 입력하세요"
          />
          <TextField
            required
            autoComplete="new-password"
            disabled={isSubmitting}
            label="비밀번호"
            name="password"
            placeholder="비밀번호를 입력하세요"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>
                    <IconButton
                      edge="end"
                      disabled={isSubmitting}
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
            required
            autoComplete="new-password"
            disabled={isSubmitting}
            error={Boolean(passwordError)}
            helperText={passwordError || " "}
            label="비밀번호 확인"
            name="passwordConfirm"
            placeholder="비밀번호를 다시 입력하세요"
            type={showPassword ? "text" : "password"}
          />

          <Autocomplete
            multiple
            disableCloseOnSelect
            disabled={isSubmitting}
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
              취소
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {isSubmitting ? <CircularProgress color="inherit" size={20} /> : "저장"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
