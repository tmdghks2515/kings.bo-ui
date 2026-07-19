"use client";

import { useMemo } from "react";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { Alert, Box, Link, Paper, Stack, Typography } from "@mui/material";
import { displayService } from "@/api/display/displayService";

const displayKeys = {
  all: ["displays"],
};

const normalizeDisplays = (response) =>
  (Array.isArray(response) ? response : []).map((display) => ({
    ...display,
    typeName: display.typeLabel ?? "-",
  }));

export default function DisplayListPage() {
  const displaysQuery = useQuery({
    queryKey: displayKeys.all,
    queryFn: () => displayService.getDisplays(),
    select: normalizeDisplays,
  });

  const columns = useMemo(
    () => [
      {
        field: "typeName",
        headerName: "전시 페이지",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Link
            color="primary"
            component={NextLink}
            href={`/curation/page/detail?curationPageId=${params.row.id}`}
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: "curationCount",
        headerName: "큐레이션 수",
        align: "right",
        headerAlign: "right",
        width: 120,
      },
    ],
    []
  );

  const error = displaysQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "전시 페이지 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = displaysQuery.isLoading || displaysQuery.isFetching;

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
            전시 페이지 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            전시 페이지별 구성을 관리합니다.
          </Typography>
        </Box>
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
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          rows={displaysQuery.data ?? []}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
        />
      </Paper>
    </Stack>
  );
}
