"use client";

import { useRouter } from "next/navigation";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

export default function UserListPage() {
  const router = useRouter();

  return (
    <Stack spacing={2.5}>
      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Box>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
            사용자 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            백오피스에 접근할 사용자를 생성합니다.
          </Typography>
        </Box>

        <Button
          startIcon={<PersonAddIcon fontSize="small" />}
          variant="contained"
          onClick={() => router.push("/users/new")}
        >
          생성
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Typography color="text.secondary" variant="body2">
          사용자 목록 조회 API가 준비되면 이 영역에 목록을 표시합니다.
        </Typography>
      </Paper>
    </Stack>
  );
}
