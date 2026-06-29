"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { displayService } from "@/api/display/displayService";
import useConfirm from "@/hooks/useConfirm";
import { getCurationTypeLabel } from "./(detail)/_components/CurationDetailEditor";

const displayKeys = {
  all: ["displays"],
};

const getDetailSummary = (display) => {
  const detail = display.detail;

  if (!detail) {
    return "-";
  }
  if (Array.isArray(detail.items)) {
    return `${detail.items.length}개 항목`;
  }
  if (Array.isArray(detail.productCodes)) {
    return `${detail.productCodes.length}개 상품`;
  }

  return "-";
};

const normalizeDisplays = (response) =>
  (Array.isArray(response) ? response : []).map((display) => ({
    ...display,
    typeName: getCurationTypeLabel(display.type),
    detailSummary: getDetailSummary(display),
  }));

export default function DisplayListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const displaysQuery = useQuery({
    queryKey: displayKeys.all,
    queryFn: () => displayService.getDisplays(),
    select: normalizeDisplays,
  });

  const deleteDisplaysMutation = useMutation({
    mutationFn: (displayIds) =>
      Promise.all(
        displayIds.map((displayId) => displayService.deleteDisplay(displayId)),
      ),
    onSuccess: async () => {
      setRowSelectionModel([]);
      await queryClient.invalidateQueries({ queryKey: displayKeys.all });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "전시 명",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Link color="primary" href={`/display/${params.row.id}`}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "typeName",
        headerName: "타입",
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: "sortOrder",
        headerName: "노출 순서",
        align: "right",
        headerAlign: "right",
        width: 120,
      },
      {
        field: "detailSummary",
        headerName: "구성",
        flex: 0.8,
        minWidth: 140,
      },
    ],
    [],
  );

  const handleDeleteClick = async () => {
    deleteDisplaysMutation.reset();

    const confirmed = await confirm({
      title: "전시 삭제",
      content: `선택한 전시 ${rowSelectionModel.length}개를 삭제하시겠습니까?`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteDisplaysMutation.mutate(rowSelectionModel);
    }
  };

  const error = deleteDisplaysMutation.error ?? displaysQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "전시 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = displaysQuery.isLoading || displaysQuery.isFetching;
  const isDeleting = deleteDisplaysMutation.isPending;
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
            전시 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            메인 배너, 카테고리, 상품 전시 구성을 관리합니다.
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
            startIcon={<AddIcon fontSize="small" />}
            variant="contained"
            onClick={() => router.push("/display/new")}
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
          rows={displaysQuery.data ?? []}
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
