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
import { productService } from "@/api/product/productService";
import useConfirm from "@/hooks/useConfirm";

const productKeys = {
  all: ["products"],
};

const normalizeProducts = (response) => {
  const products = Array.isArray(response)
    ? response
    : Array.isArray(response?.content)
      ? response.content
      : Array.isArray(response?.items)
        ? response.items
        : [];

  return products.map((product) => ({
    ...product,
    id: product.id ?? product.code,
    categoryName: product.categoryName ?? product.category?.name ?? "-",
    optionCount: product.optionCount ?? product.options?.length ?? 0,
  }));
};

const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export default function ProductListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const productsQuery = useQuery({
    queryKey: productKeys.all,
    queryFn: () => productService.getProducts(),
    select: normalizeProducts,
  });

  const deleteProductsMutation = useMutation({
    mutationFn: productService.deleteProducts,
    onSuccess: async () => {
      setRowSelectionModel([]);
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "code",
        headerName: "상품 코드",
        flex: 0.8,
        minWidth: 150,
        renderCell: (params) => (
          <Link color="primary" href={`/products/${params.row.code}`}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "name",
        headerName: "상품명",
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: "categoryName",
        headerName: "카테고리",
        flex: 0.8,
        minWidth: 160,
      },
      {
        field: "price",
        headerName: "판매가",
        align: "right",
        headerAlign: "right",
        minWidth: 130,
        valueFormatter: (value) => formatPrice(value),
      },
      {
        field: "optionCount",
        headerName: "옵션 수",
        align: "right",
        headerAlign: "right",
        width: 110,
      },
    ],
    [],
  );

  const handleDeleteClick = async () => {
    deleteProductsMutation.reset();

    const confirmed = await confirm({
      title: "상품 삭제",
      content: `선택한 상품 ${rowSelectionModel.length}개를 삭제하시겠습니까?`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteProductsMutation.mutate(rowSelectionModel);
    }
  };

  const error = deleteProductsMutation.error ?? productsQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "상품 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = productsQuery.isLoading || productsQuery.isFetching;
  const isDeleting = deleteProductsMutation.isPending;
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
            상품 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            상품 목록과 기본 판매 정보를 관리합니다.
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
            onClick={() => router.push("/products/new")}
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
          rows={productsQuery.data ?? []}
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
