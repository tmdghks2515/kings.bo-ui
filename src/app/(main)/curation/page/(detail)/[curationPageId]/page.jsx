"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { displayService } from "@/api/display/displayService";
import useConfirm from "@/hooks/useConfirm";
import { getCurationTypeLabel } from "@/app/(main)/curation/(detail)/_components/CurationDetailEditor";

const curationPageKeys = {
  all: ["displays"],
  detail: (curationPageId) => ["curation-pages", curationPageId],
};

const getDetailSummary = (curation) => {
  const detail = curation.detail;

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

const normalizeCurations = (curations) =>
  [...(Array.isArray(curations) ? curations : [])]
    .sort((first, second) => {
      const orderComparison = (first.sortOrder ?? 0) - (second.sortOrder ?? 0);

      if (orderComparison !== 0) {
        return orderComparison;
      }

      return (first.id ?? 0) - (second.id ?? 0);
    })
    .map((curation, index) => ({
      ...curation,
      orderIndex: index,
      typeName: getCurationTypeLabel(curation.type),
      detailSummary: getDetailSummary(curation),
    }));

export default function CurationPageDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { curationPageId } = useParams();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const curationPageQuery = useQuery({
    queryKey: curationPageKeys.detail(curationPageId),
    queryFn: () => displayService.getCurationPage(curationPageId),
    enabled: Boolean(curationPageId),
  });

  const deleteCurationsMutation = useMutation({
    mutationFn: (curationIds) =>
      Promise.all(curationIds.map((curationId) => displayService.deleteDisplay(curationId))),
    onSuccess: async () => {
      setRowSelectionModel([]);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: curationPageKeys.detail(curationPageId),
        }),
        queryClient.invalidateQueries({ queryKey: curationPageKeys.all }),
      ]);
    },
  });

  const updateSortOrdersMutation = useMutation({
    mutationFn: displayService.updateCurationSortOrders,
    onSuccess: async () => {
      await curationPageQuery.refetch();
    },
  });

  const curationPage = curationPageQuery.data;
  const rows = normalizeCurations(curationPage?.curations);
  const isLoading = curationPageQuery.isLoading || curationPageQuery.isFetching;
  const isMoving = updateSortOrdersMutation.isPending;

  const handleMoveClick = (rowIndex, direction) => {
    updateSortOrdersMutation.reset();

    const targetIndex = rowIndex + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return;
    }

    const reorderedRows = [...rows];
    [reorderedRows[rowIndex], reorderedRows[targetIndex]] = [
      reorderedRows[targetIndex],
      reorderedRows[rowIndex],
    ];

    updateSortOrdersMutation.mutate(
      reorderedRows.map((row, index) => ({
        id: row.id,
        sortOrder: index,
      }))
    );
  };

  const columns = useMemo(
    () => [
      {
        field: "move",
        headerName: "순서 이동",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 110,
        renderCell: (params) => {
          const rowIndex = params.row.orderIndex;

          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="위로 이동">
                <span>
                  <IconButton
                    disabled={isMoving || rowIndex === 0}
                    size="small"
                    onClick={() => handleMoveClick(rowIndex, -1)}
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="아래로 이동">
                <span>
                  <IconButton
                    disabled={isMoving || rowIndex === rows.length - 1}
                    size="small"
                    onClick={() => handleMoveClick(rowIndex, 1)}
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        field: "name",
        headerName: "큐레이션 명",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Link
            color="primary"
            href={`/curation/${params.row.id}?curationPageId=${curationPageId}`}
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: "typeName",
        headerName: "큐레이션 타입",
        flex: 0.8,
        minWidth: 150,
      },
      {
        field: "detailSummary",
        headerName: "구성",
        flex: 0.7,
        minWidth: 130,
      },
    ],
    [curationPageId, isMoving, rows]
  );

  const handleDeleteClick = async () => {
    deleteCurationsMutation.reset();

    const confirmed = await confirm({
      title: "큐레이션 삭제",
      content: `선택한 큐레이션 ${rowSelectionModel.length}개를 삭제하시겠습니까?`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteCurationsMutation.mutate(rowSelectionModel);
    }
  };

  const error =
    updateSortOrdersMutation.error ?? deleteCurationsMutation.error ?? curationPageQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "전시 페이지 처리 중 오류가 발생했습니다."
        : "";
  const isDeleting = deleteCurationsMutation.isPending;
  const selectedCount = rowSelectionModel.length;

  return (
    <Stack spacing={2.5}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          전시 페이지 상세
        </Typography>
        <Typography color="text.secondary" variant="body2">
          전시 페이지에 노출할 큐레이션 구성을 관리합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack spacing={2} sx={{ maxWidth: 640 }}>
          <TextField
            disabled
            fullWidth
            label="전시 페이지 유형"
            value={curationPage?.typeLabel ?? ""}
          />
        </Stack>
      </Paper>

      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Typography component="h3" variant="h6" sx={{ fontWeight: 800 }}>
          큐레이션 목록
        </Typography>

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
            disabled={isLoading}
            startIcon={<AddIcon fontSize="small" />}
            variant="contained"
            onClick={() => router.push(`/curation/new?curationPageId=${curationPageId}`)}
          >
            큐레이션 추가
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          height: 520,
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
          rows={rows}
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
