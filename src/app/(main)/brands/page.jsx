"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
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
import { brandService } from "@/api/brand/brandService";
import useConfirm from "@/hooks/useConfirm";

const brandKeys = {
  all: ["brands"],
};

const getImageName = (image, storageKey) => {
  if (typeof image === "string") {
    return image;
  }

  return image?.originalName ?? storageKey ?? "-";
};

const normalizeBrands = (response) =>
  (Array.isArray(response) ? response : []).map((brand) => ({
    ...brand,
    introduce: brand.introduce || "-",
    logoName: getImageName(brand.logo, brand.logoStorageKey),
    imageName: getImageName(brand.mainImage, brand.mainImageStorageKey),
  }));

export default function BrandListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const brandsQuery = useQuery({
    queryKey: brandKeys.all,
    queryFn: () => brandService.getBrands(),
    select: normalizeBrands,
  });

  const deleteBrandsMutation = useMutation({
    mutationFn: (brandIds) =>
      Promise.all(brandIds.map((brandId) => brandService.deleteBrand(brandId))),
    onSuccess: async () => {
      setRowSelectionModel([]);
      await queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "브랜드 명",
        flex: 0.8,
        minWidth: 180,
        renderCell: (params) => (
          <Link
            color="primary"
            component={NextLink}
            href={`/brands/edit?brandId=${params.row.id}`}
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: "introduce",
        headerName: "소개",
        flex: 1.2,
        minWidth: 260,
      },
      {
        field: "sortOrder",
        headerName: "노출 순서",
        align: "right",
        headerAlign: "right",
        width: 120,
      },
      {
        field: "logoName",
        headerName: "로고",
        flex: 0.8,
        minWidth: 180,
      },
      {
        field: "imageName",
        headerName: "대표 이미지",
        flex: 1,
        minWidth: 220,
      },
    ],
    []
  );

  const handleDeleteClick = async () => {
    deleteBrandsMutation.reset();

    const confirmed = await confirm({
      title: "브랜드 삭제",
      content: `선택한 브랜드 ${rowSelectionModel.length}개를 삭제하시겠습니까?`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteBrandsMutation.mutate(rowSelectionModel);
    }
  };

  const error = deleteBrandsMutation.error ?? brandsQuery.error;
  const errorMessage =
    error instanceof Error ? error.message : error ? "브랜드 처리 중 오류가 발생했습니다." : "";
  const isLoading = brandsQuery.isLoading || brandsQuery.isFetching;
  const isDeleting = deleteBrandsMutation.isPending;
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
            브랜드 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            상품에 연결할 브랜드와 대표 이미지를 관리합니다.
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
            onClick={() => router.push("/brands/new")}
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
          rows={brandsQuery.data ?? []}
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
