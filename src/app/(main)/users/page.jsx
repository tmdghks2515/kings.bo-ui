"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { userService } from "@/api/user/userService";
import useConfirm from "@/hooks/useConfirm";

const userKeys = {
  all: ["users"],
};

const normalizeUsers = (response) =>
  (Array.isArray(response) ? response : []).map((user) => ({
    ...user,
    id: user.username,
    roleLabels: Array.isArray(user.roles)
      ? user.roles.map((role) => role.label ?? role.code).join(", ")
      : "-",
  }));

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function UserListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const usersQuery = useQuery({
    queryKey: userKeys.all,
    queryFn: () => userService.getUsers(),
    select: normalizeUsers,
  });

  const deleteUsersMutation = useMutation({
    mutationFn: userService.deleteUsers,
    onSuccess: async () => {
      setRowSelectionModel([]);
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "username",
        headerName: "아이디",
        flex: 0.8,
        minWidth: 180,
        renderCell: (params) => (
          <Link color="primary" href={`/users/${encodeURIComponent(params.value)}`}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "nickname",
        headerName: "닉네임",
        flex: 0.8,
        minWidth: 180,
      },
      {
        field: "roleLabels",
        headerName: "권한",
        flex: 1.2,
        minWidth: 260,
        renderCell: (params) => (
          <Stack
            alignItems="center"
            direction="row"
            spacing={0.75}
            sx={{ height: "100%", overflow: "hidden" }}
          >
            {(Array.isArray(params.row.roles) ? params.row.roles : []).map((role) => (
              <Chip
                key={role.code}
                label={role.label ?? role.code}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ),
      },
      {
        field: "createdAt",
        headerName: "생성일",
        minWidth: 180,
        valueFormatter: (value) => formatDateTime(value),
      },
      {
        field: "updatedAt",
        headerName: "수정일",
        minWidth: 180,
        valueFormatter: (value) => formatDateTime(value),
      },
    ],
    []
  );

  const handleDeleteClick = async () => {
    deleteUsersMutation.reset();

    const confirmed = await confirm({
      title: "사용자 삭제",
      content: `선택한 사용자 ${rowSelectionModel.length}명을 삭제하시겠습니까?`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteUsersMutation.mutate(rowSelectionModel);
    }
  };

  const error = deleteUsersMutation.error ?? usersQuery.error;
  const errorMessage =
    error instanceof Error ? error.message : error ? "사용자 처리 중 오류가 발생했습니다." : "";
  const isLoading = usersQuery.isLoading || usersQuery.isFetching;
  const isDeleting = deleteUsersMutation.isPending;
  const selectedCount = rowSelectionModel.length;

  return (
    <Stack spacing={2.5}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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

        <Stack direction="row" spacing={1}>
          <Button
            color="error"
            disabled={selectedCount === 0 || isDeleting || isLoading}
            startIcon={
              isDeleting ? (
                <CircularProgress color="inherit" size={16} />
              ) : (
                <DeleteIcon fontSize="small" />
              )
            }
            variant="outlined"
            onClick={handleDeleteClick}
          >
            삭제
          </Button>
          <Button
            startIcon={<PersonAddIcon fontSize="small" />}
            variant="contained"
            onClick={() => router.push("/users/new")}
          >
            생성
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          height: 560,
          overflow: "hidden",
        }}
      >
        <DataGrid
          checkboxSelection
          disableRowSelectionOnClick
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          rowSelectionModel={rowSelectionModel}
          rows={usersQuery.data ?? []}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          onRowSelectionModelChange={(newSelectionModel) => {
            setRowSelectionModel(newSelectionModel);
          }}
        />
      </Paper>
    </Stack>
  );
}
